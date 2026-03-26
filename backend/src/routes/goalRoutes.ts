import express from 'express';
import {
    createGoal,
    getGoals,
    toggleGoal,
    deleteGoal
} from '../controllers/goalController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getGoals)
    .post(createGoal);

router.route('/:id')
    .put(toggleGoal)
    .delete(deleteGoal);

export default router;
