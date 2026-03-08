import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Button, Typography, Container, CircularProgress } from '@mui/material';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthContext } from './context/AuthContext';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const auth = useContext(AuthContext);
    if (auth?.loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            <CircularProgress />
        </Box>
    );
    return auth?.user ? children : <Navigate to="/login" replace />;
};

const Dashboard = () => {
    const auth = useContext(AuthContext);
    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, textAlign: 'center' }}>
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                    Welcome, {auth?.user?.username}!
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                    You have successfully logged in. Enjoy your stay.
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={auth?.logout}
                    size="large"
                >
                    Logout
                </Button>
            </Box>
        </Container>
    );
};

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />
        </Routes>
    );
}

export default App;
