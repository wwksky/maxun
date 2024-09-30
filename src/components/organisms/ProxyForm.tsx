import React, { useState } from 'react';
import { TextField, Button, RadioGroup, FormControlLabel, Radio, Box, Typography } from '@mui/material';
import { styled } from '@mui/system';
import axios from 'axios';

const FormContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '20px',
    borderRadius: '8px',
});

const FormControl = styled(Box)({
    marginBottom: '16px',
});

const ProxyForm: React.FC = () => {
    const [proxyConfig, setProxyConfig] = useState({
        type: 'http',
        server: '',
        username: '',
        password: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProxyConfig({ ...proxyConfig, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/proxy/config', proxyConfig);
            if (response.status === 200) {
                return response.data;
              } else {
                throw new Error(`Failed to submit proxy configuration. Try again.`);
              }
        } catch (error) {
            alert('Error submitting proxy configuration');
        }
    };

    return (
        <FormContainer>
            <form onSubmit={handleSubmit}>
                <FormControl>
                    <Typography variant="subtitle1" gutterBottom>Select Proxy Type</Typography>
                    <RadioGroup
                        name="type"
                        value={proxyConfig.type}
                        onChange={handleChange}
                        row
                    >
                        <FormControlLabel value="http" control={<Radio />} label="HTTP" />
                        <FormControlLabel value="https" control={<Radio />} label="HTTPS" />
                        <FormControlLabel value="socks5" control={<Radio />} label="SOCKS5" />
                    </RadioGroup>
                </FormControl>

                <Typography variant="subtitle1" gutterBottom style={{ marginBottom: '20px', marginTop: '20px' }}>Proxy Configuration</Typography>

                <FormControl>
                    <TextField
                        label="Proxy Server URL"
                        name="server"
                        value={proxyConfig.server}
                        onChange={handleChange}
                        fullWidth
                        required
                        helperText="e.g., http://proxy-server.com:8080"
                    />
                </FormControl>

                <FormControl>
                    <TextField
                        label="Username (Optional)"
                        name="username"
                        value={proxyConfig.username}
                        onChange={handleChange}
                        fullWidth
                    />
                </FormControl>

                <FormControl>
                    <TextField
                        label="Password (Optional)"
                        name="password"
                        value={proxyConfig.password}
                        onChange={handleChange}
                        type="password"
                        fullWidth
                    />
                </FormControl>

                <Button variant="contained" color="primary" type="submit" fullWidth>
                    Add Proxy
                </Button>
            </form>
        </FormContainer>
    );
};

export default ProxyForm;