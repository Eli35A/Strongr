import React, { useState, useEffect, useContext } from 'react';
import {
    Container,
    Box,
    Typography,
    Avatar,
    Paper,
    Grid,
    Button,
    Divider,
    CircularProgress
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import EditProfileDialog from '../components/EditProfileDialog';

const Profile: React.FC = () => {
    const auth = useContext(AuthContext);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/users/profile');
            setProfile(data);
        } catch (error) {
            console.error('Failed to fetch profile', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = (updatedUser: any) => {
        setProfile(updatedUser);
        if (auth?.updateUser) {
            auth.updateUser(updatedUser);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!profile) return <Typography>Failed to load profile.</Typography>;

    const avatarUrl = profile.profileImage?.startsWith('http')
        ? profile.profileImage
        : (profile.profileImage !== 'default-profile.png' ? `http://localhost:5000${profile.profileImage}` : undefined);

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <Grid container spacing={4} alignItems="center">
                    {/* @ts-ignore */}
                    <Grid item>
                        <Avatar
                            src={avatarUrl}
                            sx={{ width: 120, height: 120 }}
                        />
                    </Grid>
                    {/* @ts-ignore */}
                    <Grid item xs>
                        <Typography variant="h4" fontWeight="bold">
                            {profile.username}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                            {profile.email}
                        </Typography>
                        <Box mt={2}>
                            <Button variant="outlined" onClick={() => setEditOpen(true)}>
                                Edit Profile
                            </Button>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h5" fontWeight="bold" mb={2}>
                    My Posts
                </Typography>

                {/* Future Integration Point for actual user posts */}
                <Box sx={{ p: 4, textAlign: 'center', backgroundColor: 'background.default', borderRadius: 2 }}>
                    <Typography color="text.secondary">
                        You haven't made any posts yet!
                    </Typography>
                </Box>
            </Paper>

            <EditProfileDialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                user={profile}
                onProfileUpdate={handleProfileUpdate}
            />
        </Container>
    );
};

export default Profile;
