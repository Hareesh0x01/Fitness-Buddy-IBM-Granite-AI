import { Router } from 'express';
import { recommendMeal, getMealHistory } from '../controllers/nutritionController';

const router = Router();

router.post('/recommend', recommendMeal);
router.get('/history', getMealHistory);

export default router;
