import React, { useState, useContext, useRef } from 'react';
import { Card, CardContent, TextField, Button, Box, Avatar, CircularProgress, IconButton } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

interface CreatePostWidgetProps {
    onPostCreated: (newPost: any) => void;
}

const CreatePostWidget: React.FC<CreatePostWidgetProps> = ({ onPostCreated }) => {
    const auth = useContext(AuthContext);
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const avatarUrl = auth?.user?.profileImage?.startsWith('http')
        ? auth.user.profileImage
        : (auth?.user?.profileImage !== 'default-profile.png' ? `http://localhost:5000${auth?.user?.profileImage}` : undefined);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async () => {
        if (!content.trim() && !imageFile) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('content', content);
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const { data } = await api.post('/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setContent('');
            handleRemoveImage();
            onPostCreated(data);
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
                <Box display="flex" gap={2}>
                    <Avatar src={avatarUrl} alt={auth?.user?.username} />
                    <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        placeholder={`What's on your mind, ${auth?.user?.username}?`}
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={loading}
                    />
                </Box>

                {imagePreview && (
                    <Box sx={{ position: 'relative', mt: 2, mb: 1, borderRadius: 1, overflow: 'hidden' }}>
                        <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: 400, objectFit: 'contain' }} />
                        <IconButton
                            size="small"
                            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                            onClick={handleRemoveImage}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                )}

                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} pt={2} borderTop="1px solid #eee">
                    <Button
                        startIcon={<PhotoCameraIcon />}
                        component="label"
                        sx={{ textTransform: 'none', color: 'text.secondary' }}
                        disabled={loading}
                    >
                        Photo
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                        />
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ borderRadius: 20, px: 4, textTransform: 'none' }}
                        onClick={handleSubmit}
                        disabled={loading || (!content.trim() && !imageFile)}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Post'}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default CreatePostWidget;
