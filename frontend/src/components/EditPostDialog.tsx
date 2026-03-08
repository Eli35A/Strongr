import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    CircularProgress,
    IconButton
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import api from '../api/axios';

interface EditPostDialogProps {
    open: boolean;
    onClose: () => void;
    post: any;
    onPostUpdated: (updatedPost: any) => void;
}

const EditPostDialog: React.FC<EditPostDialogProps> = ({ open, onClose, post, onPostUpdated }) => {
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (post && open) {
            setContent(post.content);
            setImagePreview(post.image ? `http://localhost:5000${post.image}` : null);
            setImageFile(null);
        }
    }, [post, open]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim() && !imagePreview) return;

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('content', content);

            if (imageFile) {
                formData.append('image', imageFile);
            }

            const { data: updatedPost } = await api.put(`/posts/${post._id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            onPostUpdated(updatedPost);
            onClose();
        } catch (err) {
            console.error('Failed to update post', err);
            alert('Failed to update post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Edit Post</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        variant="outlined"
                        placeholder="What's on your mind?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={loading}
                        sx={{ mb: 2 }}
                    />

                    {imagePreview && (
                        <Box sx={{ position: 'relative', mb: 2, borderRadius: 1, overflow: 'hidden', bgcolor: 'background.default', display: 'flex', justifyContent: 'center' }}>
                            <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }} />
                            <IconButton
                                size="small"
                                sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                                onClick={handleRemoveImage}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    )}

                    <Button
                        startIcon={<PhotoCameraIcon />}
                        component="label"
                        sx={{ textTransform: 'none', color: 'text.secondary' }}
                        disabled={loading}
                    >
                        {imagePreview ? 'Change Photo' : 'Add Photo'}
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                        />
                    </Button>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || (!content.trim() && !imagePreview)}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EditPostDialog;
