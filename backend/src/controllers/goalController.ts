import { Response } from 'express';
import Goal from '../models/Goal';
import { AuthRequest } from '../middleware/authMiddleware';

export const createGoal = async (req: AuthRequest, res: Response) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ message: 'Goal text is required' });
        }

        const newGoal = new Goal({
            author: req.user?._id,
            text
        });

        const savedGoal = await newGoal.save();
        res.status(201).json(savedGoal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating goal' });
    }
};

export const getGoals = async (req: AuthRequest, res: Response) => {
    try {
        const goals = await Goal.find({ author: req.user?._id }).sort({ createdAt: -1 });
        res.json(goals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching goals' });
    }
};

export const toggleGoal = async (req: AuthRequest, res: Response) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        if (goal.author.toString() !== req.user?._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        goal.completed = !goal.completed;
        await goal.save();
        res.json(goal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating goal' });
    }
};

export const deleteGoal = async (req: AuthRequest, res: Response) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        if (goal.author.toString() !== req.user?._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await goal.deleteOne();
        res.json({ message: 'Goal removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting goal' });
    }
};
