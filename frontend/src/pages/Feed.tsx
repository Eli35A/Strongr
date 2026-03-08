import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Box, Typography, CircularProgress } from '@mui/material';
import CreatePostWidget from '../components/CreatePostWidget';
import PostCard from '../components/PostCard';
import api from '../api/axios';

const Feed: React.FC = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const observer = useRef<IntersectionObserver | null>(null);
    const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loadingMore, hasMore]);

    const fetchPosts = async (currentPage: number) => {
        if (currentPage === 1) setLoading(true);
        else setLoadingMore(true);

        try {
            const { data } = await api.get(`/posts?page=${currentPage}&limit=10`);
            if (currentPage === 1) {
                setPosts(data.posts);
            } else {
                setPosts(prev => [...prev, ...data.posts]);
            }
            setHasMore(data.hasMore);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchPosts(page);
    }, [page]);

    const handlePostCreated = (newPost: any) => {
        setPosts([newPost, ...posts]);
    };

    const handlePostUpdated = (updatedPost: any) => {
        setPosts(posts.map(post => post._id === updatedPost._id ? updatedPost : post));
    };

    const handlePostDeleted = (deletedPostId: string) => {
        setPosts(posts.filter(post => post._id !== deletedPostId));
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
                                onPostDeleted={handlePostDeleted}
                            />
                        ))}

                        <Box ref={lastPostElementRef} display="flex" justifyContent="center" mt={3} mb={4} height={40}>
                            {loadingMore && <CircularProgress size={24} />}
                        </Box>
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default Feed;
