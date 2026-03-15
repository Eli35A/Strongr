import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Feed from './pages/Feed';
import Search from './pages/Search';
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

import Sidebar from './components/Sidebar';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar />
            <Box sx={{ flexGrow: 1, ml: '280px', minHeight: '100vh', bgcolor: 'background.default' }}>
                <Box sx={{ py: 4 }}>
                    {children}
                </Box>
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
