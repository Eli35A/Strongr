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
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (post && open) {
            setContent(post.content);
            setExistingImages(post.images || (post.image ? [post.image] : []));
            setNewImageFiles([]);
            newImagePreviews.forEach(p => URL.revokeObjectURL(p));
            setNewImagePreviews([]);
        }
    }, [post, open]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const totalImages = existingImages.length + newImageFiles.length + files.length;

            if (totalImages > 5) {
                alert('Maximum 5 images allowed.');
                return;
            }

            const previews = files.map(file => URL.createObjectURL(file));
            setNewImageFiles(prev => [...prev, ...files]);
            setNewImagePreviews(prev => [...prev, ...previews]);
        }
    };

    const handleRemoveExisting = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveNew = (index: number) => {
        const previewToRemove = newImagePreviews[index];
        setNewImageFiles(prev => prev.filter((_, i) => i !== index));
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
        URL.revokeObjectURL(previewToRemove);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim() && existingImages.length === 0 && newImageFiles.length === 0) return;

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('content', content);

            existingImages.forEach(img => {
                formData.append('existingImages', img);
            });

            newImageFiles.forEach(file => {
                formData.append('images', file);
            });

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

                    {(existingImages.length > 0 || newImagePreviews.length > 0) && (
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
                            {existingImages.map((img, index) => (
                                <Box key={`existing-${index}`} sx={{ position: 'relative', borderRadius: 1, overflow: 'hidden', height: 150 }}>
                                    <img src={`http://localhost:5000${img}`} alt="Existing" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <IconButton
                                        size="small"
                                        sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                                        onClick={() => handleRemoveExisting(index)}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))}
                            {newImagePreviews.map((preview, index) => (
                                <Box key={`new-${index}`} sx={{ position: 'relative', borderRadius: 1, overflow: 'hidden', height: 150 }}>
                                    <img src={preview} alt="New Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <IconButton
                                        size="small"
                                        sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                                        onClick={() => handleRemoveNew(index)}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                    )}

                    <Button
                        startIcon={<PhotoCameraIcon />}
                        component="label"
                        sx={{ textTransform: 'none', color: 'text.secondary' }}
                        disabled={loading || (existingImages.length + newImageFiles.length >= 5)}
                    >
                        Add Photo ({existingImages.length + newImageFiles.length}/5)
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            multiple
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
                        disabled={loading || (!content.trim() && existingImages.length === 0 && newImageFiles.length === 0)}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EditPostDialog;
