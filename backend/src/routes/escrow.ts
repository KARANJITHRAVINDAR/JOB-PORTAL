import { Router } from 'express';
import { requestCompletion, verifyCompletion } from '../controllers/escrow';

const router = Router();

router.post('/request-completion', requestCompletion);
router.post('/verify-completion', verifyCompletion);

export default router;
