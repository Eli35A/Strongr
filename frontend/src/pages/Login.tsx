import React, { useState, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    Link,
    CircularProgress
} from '@mui/material';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            if (auth) {
                const { accessToken, ...userData } = response.data;
                auth.login(userData, accessToken);
                navigate('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxWidth="xs" sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <Card sx={{ width: '100%' }}>
                    <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="h4" component="h1" align="center" gutterBottom fontWeight="bold">
                            Welcome Back
                        </Typography>
                        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 2 }}>
                            Login to Strongr
                        </Typography>

                        {error && <Alert severity="error">{error}</Alert>}

                        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="Email address"
                                type="email"
                                fullWidth
                                variant="outlined"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                            <TextField
                                label="Password"
                                type="password"
                                fullWidth
                                variant="outlined"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth
                                disabled={isLoading}
                                sx={{ mt: 2 }}
                            >
                                {isLoading ? <CircularProgress size={24} /> : 'Login'}
                            </Button>
                        </Box>

                        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                            Don't have an account?{' '}
                            <Link component={RouterLink} to="/register" color="primary" underline="hover">
                                Sign up
                            </Link>
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
};

export default Login;
