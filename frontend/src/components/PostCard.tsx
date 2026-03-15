import React, { useState, useContext } from 'react';
import { Card, CardHeader, CardContent, CardActions, Avatar, Typography, IconButton, Box, Divider, TextField, Button, CircularProgress } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import EditPostDialog from './EditPostDialog';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

interface PostCardProps {
    post: any;
    onPostUpdated?: (updatedPost: any) => void;
    onPostDeleted?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onPostUpdated, onPostDeleted }) => {
    const auth = useContext(AuthContext);
    const [likes, setLikes] = useState<string[]>(post.likes || []);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [commentCount, setCommentCount] = useState<number>(post.commentCount || 0);

    const isLikedByMe = auth?.user?._id ? likes.includes(auth.user._id) : false;
    const isMyPost = auth?.user?._id === post.author?._id;

    const getAvatarUrl = (user: any) => {
        if (!user || !user.profileImage) return undefined;
        return user.profileImage.startsWith('http')
            ? user.profileImage
            : (user.profileImage !== 'default-profile.png' ? `http://localhost:5000${user.profileImage}` : undefined);
    };

    const handleLikeToggle = async () => {
        try {
            const { data } = await api.post(`/posts/${post._id}/like`);
            setLikes(data.likes);
            if (onPostUpdated) {
                onPostUpdated({ ...post, likes: data.likes });
            }
        } catch (error) {
            console.error('Failed to toggle like', error);
        }
    };

    const handleDeletePost = async () => {
        try {
            await api.delete(`/posts/${post._id}`);
            if (onPostDeleted) {
                onPostDeleted(post._id);
            }
            setDeleteOpen(false);
        } catch (error) {
            console.error('Failed to delete post', error);
            alert('Failed to delete post.');
        }
    };

    const fetchComments = async () => {
        setLoadingComments(true);
        try {
            const { data } = await api.get(`/posts/${post._id}/comments`);
            setComments(data);
        } catch (error) {
            console.error('Failed to fetch comments', error);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleToggleComments = () => {
        if (!showComments && comments.length === 0) {
            fetchComments();
        }
        setShowComments(!showComments);
    };

    const handleCommentSubmit = async () => {
        if (!newComment.trim()) return;

        setSubmittingComment(true);
        try {
            const { data } = await api.post(`/posts/${post._id}/comments`, { content: newComment });
            setComments([...comments, data]);
            setCommentCount(prev => prev + 1);
            setNewComment('');
        } catch (error) {
            console.error('Failed to submit comment', error);
        } finally {
            setSubmittingComment(false);
        }
    };

    const formatTimestamp = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}>
            <CardHeader
                avatar={<Avatar src={getAvatarUrl(post.author)} alt={post.author?.username} />}
                action={
                    isMyPost && (
                        <Box display="flex">
                            <IconButton onClick={() => setEditOpen(true)} size="small" sx={{ mt: 1 }}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton onClick={() => setDeleteOpen(true)} size="small" sx={{ mt: 1, mr: 1, color: 'error.main' }}>
                                <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    )
                }
                title={<Typography variant="subtitle1" fontWeight="bold">{post.author?.username}</Typography>}
                subheader={<Typography variant="caption" color="text.secondary">{formatTimestamp(post.createdAt)}</Typography>}
            />
            <CardContent sx={{ pt: 0, pb: 1 }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: (post.image || (post.images && post.images.length > 0)) ? 2 : 0 }}>
                    {post.content}
                </Typography>

                {post.image && !post.images?.length && (
                    <Box sx={{ mt: 1, borderRadius: 2, overflow: 'hidden', bgcolor: 'background.default', display: 'flex', justifyContent: 'center' }}>
                        <img
                            src={`http://localhost:5000${post.image}`}
                            alt="Post content"
                            style={{ maxWidth: '100%', maxHeight: 500, objectFit: 'contain' }}
                        />
                    </Box>
                )}

                {post.images && post.images.length > 0 && (
                    <Box sx={{
                        mt: 1,
                        display: 'grid',
                        gap: 0.5,
                        gridTemplateColumns: post.images.length === 1 ? '1fr' : '1fr 1fr',
                        borderRadius: 2,
                        overflow: 'hidden',
                        bgcolor: 'background.default'
                    }}>
                        {post.images.map((img: string, index: number) => (
                            <Box
                                key={index}
                                sx={{
                                    gridColumn: (post.images.length === 3 && index === 0) ? 'span 2' : 'span 1',
                                    height: post.images.length === 1 ? 'auto' : 250,
                                    overflow: 'hidden'
                                }}
                            >
                                <img
                                    src={`http://localhost:5000${img}`}
                                    alt={`Post content ${index + 1}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </Box>
                        ))}
                    </Box>
                )}
            </CardContent>

            <CardActions disableSpacing sx={{ px: 2, display: 'flex', gap: 1 }}>
                <Box display="flex" alignItems="center">
                    <IconButton onClick={handleLikeToggle} color={isLikedByMe ? "error" : "default"}>
                        {isLikedByMe ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                    <Typography variant="body2" color="text.secondary">{likes.length}</Typography>
                </Box>

                <Box display="flex" alignItems="center">
                    <IconButton onClick={handleToggleComments}>
                        <ChatBubbleOutlineIcon />
                    </IconButton>
                    <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={handleToggleComments}>
                        {commentCount > 0 ? `View all ${commentCount} comments` : 'Be the first to comment'}
                    </Typography>
                </Box>
            </CardActions>

            {showComments && (
                <Box sx={{ px: 2, pb: 2, bgcolor: 'background.default', borderRadius: 2, mt: 1 }}>
                    <Divider sx={{ mb: 2 }} />

                    {loadingComments ? (
                        <Box display="flex" justifyContent="center" p={2}><CircularProgress size={24} /></Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2, maxHeight: 300, overflowY: 'auto' }}>
                            {comments.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" textAlign="center">No comments yet. Be the first!</Typography>
                            ) : (
                                comments.map(comment => (
                                    <Box key={comment._id} display="flex" gap={1.5}>
                                        <Avatar src={getAvatarUrl(comment.author)} sx={{ width: 32, height: 32 }} />
                                        <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 2, flexGrow: 1 }}>
                                            <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                                                {comment.author?.username}
                                                <Typography variant="caption" color="text.secondary" ml={1}>
                                                    {formatTimestamp(comment.createdAt)}
                                                </Typography>
                                            </Typography>
                                            <Typography variant="body2" color="text.primary">{comment.content}</Typography>
                                        </Box>
                                    </Box>
                                ))
                            )}
                        </Box>
                    )}

                    <Box display="flex" gap={1} mt={1}>
                        <Avatar src={getAvatarUrl(auth?.user)} sx={{ width: 32, height: 32 }} />
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleCommentSubmit()}
                            disabled={submittingComment}
                        />
                        <Button
                            variant="contained"
                            size="small"
                            disabled={!newComment.trim() || submittingComment}
                            onClick={handleCommentSubmit}
                        >
                            Post
                        </Button>
                    </Box>
                </Box>
            )}

            <EditPostDialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                post={post}
                onPostUpdated={(updatedPost) => {
                    if (onPostUpdated) onPostUpdated(updatedPost);
                }}
            />

            {deleteOpen && (
                <Box position="fixed" top={0} left={0} right={0} bottom={0} bgcolor="rgba(0,0,0,0.5)" display="flex" alignItems="center" justifyContent="center" zIndex={1300}>
                    <Card sx={{ p: 3, maxWidth: 400, width: '90%' }}>
                        <Typography variant="h6" mb={2}>Delete Post?</Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>Are you sure you want to delete this post? This action cannot be undone.</Typography>
                        <Box display="flex" justifyContent="flex-end" gap={1}>
                            <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
                            <Button variant="contained" color="error" onClick={handleDeletePost}>Delete</Button>
                        </Box>
                    </Card>
                </Box>
            )}
        </Card>
    );
};

export default PostCard;
