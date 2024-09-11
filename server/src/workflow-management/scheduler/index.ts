import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { deleteFile, readFile, readFiles, saveFile } from "../storage";
import { createRemoteBrowserForRun, destroyRemoteBrowser } from '../../browser-management/controller';
import logger from '../../logger';
import { browserPool } from "../../server";
import fs from "fs";
import { uuid } from "uuidv4";
import { chromium } from "playwright";

const connection = new IORedis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: null,
});

connection.on('connect', () => {
  console.log('Connected to Redis!');
});

connection.on('error', (err) => {
  console.error('Redis connection error:', err);
});

const workflowQueue = new Queue('workflow', { connection });

export const worker = new Worker('workflow', async job => {
  const { fileName, runId } = job.data;
  try {
    const result = await runWorkflow(fileName, runId);
    return result;
  } catch (error) {
    console.error('Error running workflow:', error);
    throw error;
  }
}, { connection });

worker.on('completed', (job: any) => {
  console.log(`Job ${job.id} completed for ${job.data.fileName}_${job.data.runId}`);
});

worker.on('failed', (job: any, err) => {
  console.error(`Job ${job.id} failed for ${job.data.fileName}_${job.data.runId}:`, err);
});

async function runWorkflow(fileName: string, runId: string) {
  try {
    // Create a browser for the run
    const browserId = createRemoteBrowserForRun({
      browser: chromium,
      launchOptions: { headless: true }
    });

    // Create a unique runId if not provided
    if (!runId) {
      runId = uuid();
    }

    // Set up run metadata
    const run_meta = {
      status: 'RUNNING',
      name: fileName,
      startedAt: new Date().toLocaleString(),
      finishedAt: '',
      duration: '',
      task: '', // Optionally set based on workflow
      browserId: browserId,
      interpreterSettings: {}, // Placeholder for any settings needed
      log: '',
      runId: runId,
    };

    // Ensure directory exists
    fs.mkdirSync('../storage/runs', { recursive: true });

    // Save the run metadata to a file
    await saveFile(
      `../storage/runs/${fileName}_${runId}.json`,
      JSON.stringify(run_meta, null, 2)
    );

    // Log creation of the run
    logger.log('debug', `Created run with name: ${fileName}_${runId}.json`);

    return {
      browserId: browserId,
      runId: runId,
    };
  } catch (e) {
    const { message } = e as Error;
    logger.log('info', `Error while creating a run with name: ${fileName}_${runId}.json`);
    return false;
  }
}

export { workflowQueue, runWorkflow };