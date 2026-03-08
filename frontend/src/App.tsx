import { useContext } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, CircularProgress, AppBar, Toolbar, Avatar, IconButton } from '@mui/material';
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

import Feed from './pages/Feed';
import Search from './pages/Search';

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
                        <Feed />
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
            <Route path="/search" element={
                <ProtectedRoute>
                    <MainLayout>
                        <Search />
                    </MainLayout>
                </ProtectedRoute>
            } />
        </Routes>
    );
}

export default App;
