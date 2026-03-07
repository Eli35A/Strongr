import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthContext } from './context/AuthContext';
import './index.css';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const auth = useContext(AuthContext);
    if (auth?.loading) return <div>Loading...</div>;
    return auth?.user ? children : <Navigate to="/login" replace />;
};

const Dashboard = () => {
    const auth = useContext(AuthContext);
    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>Welcome, {auth?.user?.username}!</h1>
            <p style={{ margin: '20px 0', color: '#ccc' }}>You have successfully logged in.</p>
            <button onClick={auth?.logout} className="btn-primary" style={{ padding: '10px 20px' }}>Logout</button>
        </div>
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
