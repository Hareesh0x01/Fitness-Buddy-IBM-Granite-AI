import { Router } from 'express';
import { getProgress, getWorkoutHistory, getDailyPlan } from '../controllers/progressController';

const router = Router();

router.get('/progress', getProgress);
router.get('/history', getWorkoutHistory);
router.get('/daily-plan', getDailyPlan);

export default router;
