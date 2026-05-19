import { Router } from 'express';
import { createReport } from '../controllers/reports';

const router = Router();

router.post('/', createReport);

export default router;
