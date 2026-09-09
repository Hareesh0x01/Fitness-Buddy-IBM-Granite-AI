import { Router } from 'express';
import { getProfile, createProfile, updateProfile } from '../controllers/profileController';

const router = Router();

router.get('/', getProfile);
router.post('/', createProfile);
router.put('/', updateProfile);

export default router;
