import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, CircularProgress } from '@mui/material';
import CreatePostWidget from '../components/CreatePostWidget';
import PostCard from '../components/PostCard';
import api from '../api/axios';

const Feed: React.FC = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        try {
            const { data } = await api.get('/posts');
            setPosts(data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handlePostCreated = (newPost: any) => {
        setPosts([newPost, ...posts]);
    };

    const handlePostUpdated = (updatedPost: any) => {
        setPosts(posts.map(post => post._id === updatedPost._id ? updatedPost : post));
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 2, mb: 4 }}>
                <CreatePostWidget onPostCreated={handlePostCreated} />

                {loading ? (
                    <Box display="flex" justifyContent="center" mt={4}>
                        <CircularProgress />
                    </Box>
                ) : posts.length === 0 ? (
                    <Typography variant="body1" color="text.secondary" textAlign="center" mt={4}>
                        No posts yet. Be the first to share something!
                    </Typography>
                ) : (
                    <Box display="flex" flexDirection="column" gap={0}>
                        {posts.map(post => (
                            <PostCard
                                key={post._id}
                                post={post}
                                onPostUpdated={handlePostUpdated}
                            />
                        ))}
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default Feed;
