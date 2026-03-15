import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider,
    Avatar,
    Button
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { AuthContext } from '../context/AuthContext';

const Sidebar: React.FC = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { text: 'Home', icon: <HomeIcon />, path: '/' },
        { text: 'Search', icon: <SearchIcon />, path: '/search' },
        { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    ];

    const avatarUrl = auth?.user?.profileImage?.startsWith('http')
        ? auth.user.profileImage
        : (auth?.user?.profileImage !== 'default-profile.png' ? `http://localhost:5000${auth?.user?.profileImage}` : undefined);

    if (!auth?.user) return null;

    return (
        <Box sx={{
            width: 280,
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            borderRight: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
            zIndex: 1200
        }}>
            <Box sx={{ p: 3 }}>
                <Typography
                    variant="h5"
                    fontWeight="bold"
                    color="primary"
                    sx={{ cursor: 'pointer', letterSpacing: 1 }}
                    onClick={() => navigate('/')}
                >
                    Strongr
                </Typography>
            </Box>

            <List sx={{ flexGrow: 1, px: 2 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                            onClick={() => navigate(item.path)}
                            selected={location.pathname === item.path}
                            sx={{
                                borderRadius: 2,
                                '&.Mui-selected': {
                                    bgcolor: 'primary.light',
                                    color: 'primary.main',
                                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                                    '&:hover': { bgcolor: 'primary.light' }
                                },
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40, color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: location.pathname === item.path ? 'bold' : 'medium' }} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Divider />

            <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 1 }}>
                    <Avatar src={avatarUrl} alt={auth.user.username} sx={{ width: 40, height: 40 }} />
                    <Box sx={{ overflow: 'hidden' }}>
                        <Typography variant="subtitle2" fontWeight="bold" noWrap>
                            {auth.user.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {auth.user.email}
                        </Typography>
                    </Box>
                </Box>
                <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    startIcon={<LogoutIcon />}
                    onClick={auth.logout}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                    Logout
                </Button>
            </Box>
        </Box>
    );
};

export default Sidebar;
