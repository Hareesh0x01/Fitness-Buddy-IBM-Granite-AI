import { Router } from 'express';
import { generateWorkoutPlan, getTodayWorkout, completeWorkout, getMotivation } from '../controllers/workoutController';

const router = Router();

router.post('/generate', generateWorkoutPlan);
router.get('/today', getTodayWorkout);
router.post('/complete', completeWorkout);
router.get('/motivation', getMotivation);

export default router;
