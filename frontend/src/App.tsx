import { useContext } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Container, CircularProgress, AppBar, Toolbar, Avatar, IconButton } from '@mui/material';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
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
                <Typography variant="body2" color="text.secondary">
                    Use the navigation bar above to view and edit your profile.
                </Typography>
            </Box>
        </Container>
    );
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const avatarUrl = auth?.user?.profileImage?.startsWith('http')
        ? auth.user.profileImage
        : (auth?.user?.profileImage !== 'default-profile.png' ? `http://localhost:5000${auth?.user?.profileImage}` : undefined);

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Toolbar>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, cursor: 'pointer', fontWeight: 'bold' }}
                        onClick={() => navigate('/')}
                    >
                        Strongr
                    </Typography>
                    {auth?.user && (
                        <Box display="flex" alignItems="center" gap={2}>
                            <IconButton onClick={() => navigate('/profile')} size="small" sx={{ ml: 2 }}>
                                <Avatar sx={{ width: 32, height: 32 }} src={avatarUrl}></Avatar>
                            </IconButton>
                            <Button color="inherit" onClick={auth.logout}>Logout</Button>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>
            <Box sx={{ pt: 4 }}>
                {children}
            </Box>
        </Box>
    );
};

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
                <ProtectedRoute>
                    <MainLayout>
                        <Dashboard />
                    </MainLayout>
                </ProtectedRoute>
            } />
            <Route path="/profile" element={
                <ProtectedRoute>
                    <MainLayout>
                        <Profile />
                    </MainLayout>
                </ProtectedRoute>
            } />
        </Routes>
    );
}

export default App;
