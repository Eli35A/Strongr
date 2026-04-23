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
import FavoriteIcon from '@mui/icons-material/Favorite';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LogoutIcon from '@mui/icons-material/Logout';
import { AuthContext } from '../context/AuthContext';

const Sidebar: React.FC = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { text: 'Home', icon: <HomeIcon />, path: '/' },
        { text: 'Search', icon: <SearchIcon />, path: '/search' },
        { text: 'Liked Posts', icon: <FavoriteIcon />, path: '/liked' },
        { text: 'Goals', icon: <AssignmentIcon />, path: '/goals' },
        { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    ];

    const avatarUrl = auth?.user?.profileImage?.startsWith('http')
        ? auth.user.profileImage
        : (auth?.user?.profileImage !== 'default-profile.png' ? `${import.meta.env.VITE_SERVER_URL}${auth?.user?.profileImage}` : undefined);

    if (!auth?.user) return null;

    return (
        <Box sx={{
            width: 280,
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            borderRight: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
            zIndex: 1200,
        }}>
            {/* Logo */}
            <Box sx={{ p: 3, pb: 2 }}>
                <Typography
                    onClick={() => navigate('/')}
                    sx={{
                        cursor: 'pointer',
                        fontFamily: '"Barlow Condensed", sans-serif',
                        fontWeight: 700,
                        fontSize: '1.75rem',
                        letterSpacing: 2,
                        background: 'linear-gradient(135deg, #FF5A5F 0%, #FF8A8E 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        userSelect: 'none',
                    }}
                >
                    STRONGR
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', letterSpacing: 1, fontSize: '0.65rem' }}>
                    YOUR FITNESS COMMUNITY
                </Typography>
            </Box>

            <Divider />

            <List sx={{ flexGrow: 1, px: 2, pt: 2 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => navigate(item.path)}
                                selected={isActive}
                                sx={{
                                    borderRadius: 2,
                                    transition: 'all 0.15s ease',
                                    position: 'relative',
                                    '&.Mui-selected': {
                                        bgcolor: 'rgba(255, 90, 95, 0.10)',
                                        color: 'primary.main',
                                        '& .MuiListItemIcon-root': { color: 'primary.main' },
                                        '& .MuiListItemText-primary': { fontWeight: 700, color: 'primary.main' },
                                        '&:hover': { bgcolor: 'rgba(255, 90, 95, 0.15)' },
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            left: 0,
                                            top: '20%',
                                            bottom: '20%',
                                            width: '3px',
                                            borderRadius: '0 3px 3px 0',
                                            bgcolor: 'primary.main',
                                        },
                                    },
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                                        transform: 'translateX(2px)',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{
                                    minWidth: 40,
                                    color: isActive ? 'primary.main' : 'text.secondary',
                                    transition: 'color 0.15s ease',
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontWeight: isActive ? 700 : 400,
                                        fontSize: '0.95rem',
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            <Divider />

            {/* User section */}
            <Box sx={{ p: 2 }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 1.5,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                }}>
                    <Avatar src={avatarUrl} alt={auth.user.username} sx={{ width: 38, height: 38 }} />
                    <Box sx={{ overflow: 'hidden', flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold" noWrap>
                            {auth.user.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.7rem' }}>
                            {auth.user.email}
                        </Typography>
                    </Box>
                </Box>
                <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    startIcon={<LogoutIcon fontSize="small" />}
                    onClick={auth.logout}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        borderColor: 'rgba(255,255,255,0.12)',
                        color: 'text.secondary',
                        fontSize: '0.85rem',
                        py: 0.75,
                        '&:hover': {
                            borderColor: 'error.main',
                            color: 'error.main',
                            bgcolor: 'rgba(211, 47, 47, 0.08)',
                        },
                        transition: 'all 0.2s ease',
                    }}
                >
                    Logout
                </Button>
            </Box>
        </Box>
    );
};

export default Sidebar;
