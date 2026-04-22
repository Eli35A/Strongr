import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    CircularProgress,
    Alert,
    Avatar
} from '@mui/material';
import api from '../api/axios';

interface EditProfileDialogProps {
    open: boolean;
    onClose: () => void;
    user: any;
    onProfileUpdate: (userData: any) => void;
}

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({ open, onClose, user, onProfileUpdate }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setUsername(user.username);
            setEmail(user.email);
            setAvatarPreview(user.profileImage?.startsWith('http')
                ? user.profileImage
                : (user.profileImage !== 'default-profile.png' ? `${import.meta.env.VITE_SERVER_URL}${user.profileImage}` : null));
            setAvatarFile(null);
        }
    }, [user, open]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data: updatedUser } = await api.put('/users/profile', { username, email });

            if (avatarFile) {
                const formData = new FormData();
                formData.append('avatar', avatarFile);
                const { data: avatarRes } = await api.post('/users/profile/avatar', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                updatedUser.profileImage = avatarRes.profileImage;
            }

            onProfileUpdate(updatedUser);
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Edit Profile</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Box display="flex" flexDirection="column" alignItems="center" mb={3} gap={1}>
                        <Avatar
                            src={avatarPreview || undefined}
                            sx={{ width: 80, height: 80 }}
                        />
                        <Button variant="outlined" component="label" size="small">
                            Change Picture
                            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                        </Button>
                    </Box>

                    <TextField
                        label="Username"
                        fullWidth
                        margin="dense"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    {!user?.googleId && (
                        <TextField
                            label="Email"
                            fullWidth
                            margin="dense"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EditProfileDialog;
