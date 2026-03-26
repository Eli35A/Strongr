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
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const avatarUrl = auth?.user?.profileImage?.startsWith('http')
        ? auth.user.profileImage
        : (auth?.user?.profileImage !== 'default-profile.png' ? `http://localhost:5000${auth?.user?.profileImage}` : undefined);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const totalFiles = imageFiles.length + files.length;

            if (totalFiles > 5) {
                alert('You can only upload up to 5 photos.');
                return;
            }

            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImageFiles(prev => [...prev, ...files]);
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const handleRemoveImage = (index: number) => {
        const previewToRemove = imagePreviews[index];

        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));

        URL.revokeObjectURL(previewToRemove);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClearAll = () => {
        imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
        setImageFiles([]);
        setImagePreviews([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async () => {
        if (!content.trim() && imageFiles.length === 0) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('content', content);
            imageFiles.forEach(file => {
                formData.append('images', file);
            });

            const { data } = await api.post('/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setContent('');
            handleClearAll();
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

                {imagePreviews.length > 0 && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: imagePreviews.length === 1 ? '1fr' : '1fr 1fr', gap: 1, mt: 2, mb: 1 }}>
                        {imagePreviews.map((preview, index) => (
                            <Box key={index} sx={{ position: 'relative', borderRadius: 1, overflow: 'hidden', height: imagePreviews.length === 1 ? 'auto' : 200 }}>
                                <img src={preview} alt={`Preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <IconButton
                                    size="small"
                                    sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                                    onClick={() => handleRemoveImage(index)}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                )}

                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} pt={2} borderTop="1px solid #eee">
                    <Button
                        startIcon={<PhotoCameraIcon />}
                        component="label"
                        sx={{ textTransform: 'none', color: 'text.secondary' }}
                        disabled={loading || imageFiles.length >= 5}
                    >
                        Photo ({imageFiles.length}/5)
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            ref={fileInputRef}
                        />
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ borderRadius: 20, px: 4, textTransform: 'none' }}
                        onClick={handleSubmit}
                        disabled={loading || (!content.trim() && imageFiles.length === 0)}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Post'}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default CreatePostWidget;
