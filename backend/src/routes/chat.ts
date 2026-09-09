import { Router } from 'express';
import { chat, getChatHistory } from '../controllers/chatController';

const router = Router();

router.post('/', chat);
router.get('/history/:sessionId', getChatHistory);

export default router;
