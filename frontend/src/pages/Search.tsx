import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, CircularProgress, TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PostCard from '../components/PostCard';
import api from '../api/axios';

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const Search: React.FC = () => {
    const navigate = useNavigate();
    const query = useQuery().get('q') || '';

    const [searchInput, setSearchInput] = useState(query);
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

    const fetchPosts = async (currentPage: number, searchQuery: string) => {
        if (!searchQuery.trim()) {
            setLoading(false);
            setPosts([]);
            setHasMore(false);

            return;
        }

        if (currentPage === 1) {
            setLoading(true);
            setPosts([]);
        } else {
            setLoadingMore(true);
        }

        try {
            const endpoint = `/posts/search?q=${encodeURIComponent(searchQuery)}&page=${currentPage}&limit=10`;
            const { data } = await api.get(endpoint);

            if (currentPage === 1) {
                setPosts(data.posts);
            } else {
                setPosts(prev => [...prev, ...data.posts]);
            }

            setHasMore(data.hasMore);

        } catch (error) {
            console.error('Error fetching search results:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        setPage(1);
        setSearchInput(query);
        fetchPosts(1, query);
    }, [query]);

    useEffect(() => {
        if (page > 1) {
            fetchPosts(page, query);
        }
    }, [page]);

    const handleSearchSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (searchInput.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchInput)}`);
        }
    };

    const handleClearSearch = () => {
        setSearchInput('');
        navigate('/');
    };

    const handlePostUpdated = (updatedPost: any) => {
        setPosts(posts.map(post => post._id === updatedPost._id ? updatedPost : post));
    };

    const handlePostDeleted = (deletedPostId: string) => {
        setPosts(posts.filter(post => post._id !== deletedPostId));
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 2, mb: 4 }}>
                <Box display="flex" alignItems="center" mb={3} gap={1}>
                    <IconButton onClick={() => navigate('/')} sx={{ bgcolor: 'background.paper' }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box component="form" onSubmit={handleSearchSubmit} sx={{ flexGrow: 1 }}>
                        <TextField
                            fullWidth
                            placeholder="Search posts..."
                            variant="outlined"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: searchInput ? (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleClearSearch} edge="end" size="small">
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ) : null,
                                sx: { borderRadius: 4, bgcolor: 'background.paper' }
                            }}
                        />
                    </Box>
                </Box>



                {loading ? (
                    <Box display="flex" justifyContent="center" mt={4}>
                        <CircularProgress />
                    </Box>
                ) : !query.trim() ? (
                    <Box display="flex" flexDirection="column" alignItems="center" mt={6}>
                        <SearchIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" textAlign="center">
                            Search for posts
                        </Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
                            Type something above to find interesting content.
                        </Typography>
                    </Box>
                ) : posts.length === 0 ? (
                    <Box display="flex" flexDirection="column" alignItems="center" mt={6}>
                        <SearchIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" textAlign="center">
                            No posts found for "{query}"
                        </Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
                            Try searching for something else or check your spelling.
                        </Typography>
                    </Box>
                ) : (
                    <Box display="flex" flexDirection="column" gap={0}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, ml: 1 }}>
                            Search Results
                        </Typography>
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

export default Search;
