import React, { useState, useContext } from 'react';
import { Card, CardHeader, CardContent, CardActions, Avatar, Typography, IconButton, Box, Divider, TextField, Button, CircularProgress } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import EditPostDialog from './EditPostDialog';
import EditIcon from '@mui/icons-material/Edit';

interface PostCardProps {
    post: any;
    onPostUpdated?: (updatedPost: any) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onPostUpdated }) => {
    const auth = useContext(AuthContext);
    const [likes, setLikes] = useState<string[]>(post.likes || []);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

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
                        <IconButton onClick={() => setEditOpen(true)} size="small" sx={{ mt: 1, mr: 1 }}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    )
                }
                title={<Typography variant="subtitle1" fontWeight="bold">{post.author?.username}</Typography>}
                subheader={<Typography variant="caption" color="text.secondary">{formatTimestamp(post.createdAt)}</Typography>}
            />
            <CardContent sx={{ pt: 0, pb: 1 }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: post.image ? 2 : 0 }}>
                    {post.content}
                </Typography>

                {post.image && (
                    <Box sx={{ mt: 1, borderRadius: 2, overflow: 'hidden', bgcolor: 'background.default', display: 'flex', justifyContent: 'center' }}>
                        <img
                            src={`http://localhost:5000${post.image}`}
                            alt="Post content"
                            style={{ maxWidth: '100%', maxHeight: 500, objectFit: 'contain' }}
                        />
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
                    <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer' }} onClick={handleToggleComments}>
                        Comment
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
        </Card>
    );
};

export default PostCard;
