import { Router } from 'express';
import { updateHabits, getHabits, getAllHabits } from '../controllers/habitsController';

const router = Router();

router.post('/', updateHabits);
router.get('/', getHabits);
router.get('/all', getAllHabits);

export default router;
