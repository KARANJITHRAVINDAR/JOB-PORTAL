import { Router } from 'express';
import { extractJobDetails, translateText } from '../controllers/ai';

const router = Router();

router.post('/extract-job', extractJobDetails);
router.post('/translate', translateText);

export default router;
