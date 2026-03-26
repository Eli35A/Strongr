import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Checkbox,
    IconButton,
    Paper,
    CircularProgress,
    Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import api from '../api/axios';

const Goals: React.FC = () => {
    const [goals, setGoals] = useState<any[]>([]);
    const [newGoal, setNewGoal] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const { data } = await api.get('/goals');
            setGoals(data);
        } catch (error) {
            console.error('Error fetching goals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGoal.trim()) return;

        setSubmitting(true);
        try {
            const { data } = await api.post('/goals', { text: newGoal });
            setGoals([data, ...goals]);
            setNewGoal('');
        } catch (error) {
            console.error('Error adding goal:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleGoal = async (id: string) => {
        try {
            const { data } = await api.put(`/goals/${id}`);
            setGoals(goals.map(goal => goal._id === id ? data : goal));
        } catch (error) {
            console.error('Error toggling goal:', error);
        }
    };

    const handleDeleteGoal = async (id: string) => {
        try {
            await api.delete(`/goals/${id}`);
            setGoals(goals.filter(goal => goal._id !== id));
        } catch (error) {
            console.error('Error deleting goal:', error);
        }
    };

    const completedCount = goals.filter(g => g.completed).length;

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 2, mb: 4 }}>
                <Box display="flex" alignItems="center" gap={2} mb={4}>
                    <AssignmentIcon color="primary" sx={{ fontSize: 32 }} />
                    <Typography variant="h4" fontWeight="bold">My Goals</Typography>
                </Box>

                <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: 1, borderColor: 'divider' }}>
                    <form onSubmit={handleAddGoal}>
                        <Box display="flex" gap={2}>
                            <TextField
                                fullWidth
                                placeholder="Add a new goal, step by step!"
                                variant="outlined"
                                value={newGoal}
                                onChange={(e) => setNewGoal(e.target.value)}
                                disabled={submitting}
                                size="small"
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                                disabled={submitting || !newGoal.trim()}
                                sx={{ borderRadius: 2, px: 3 }}
                            >
                                Add
                            </Button>
                        </Box>
                    </form>
                </Paper>

                {loading ? (
                    <Box display="flex" justifyContent="center" mt={4}>
                        <CircularProgress />
                    </Box>
                ) : goals.length === 0 ? (
                    <Box sx={{ textAlign: 'center', mt: 8, color: 'text.secondary' }}>
                        <AssignmentIcon sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
                        <Typography variant="h6">No goals set yet.</Typography>
                        <Typography variant="body2">Start by adding your first fitness goal!</Typography>
                    </Box>
                ) : (
                    <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} px={1}>
                            <Typography variant="subtitle2" color="text.secondary">
                                {completedCount} / {goals.length} Goals Completed
                            </Typography>
                        </Box>
                        <Paper elevation={0} sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}>
                            <List disablePadding>
                                {goals.map((goal, index) => (
                                    <React.Fragment key={goal._id}>
                                        <ListItem
                                            secondaryAction={
                                                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteGoal(goal._id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            }
                                            disablePadding
                                        >
                                            <ListItemButton onClick={() => handleToggleGoal(goal._id)} sx={{ py: 1.5 }}>
                                                <ListItemIcon>
                                                    <Checkbox
                                                        edge="start"
                                                        checked={goal.completed}
                                                        tabIndex={-1}
                                                        disableRipple
                                                    />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={goal.text}
                                                    sx={{
                                                        textDecoration: goal.completed ? 'line-through' : 'none',
                                                        color: goal.completed ? 'text.secondary' : 'text.primary'
                                                    }}
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                        {index < goals.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </Paper>
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default Goals;
