import { Router } from 'express';
import { postJob, applyJob, getNearbyJobs } from '../controllers/jobs';

const router = Router();

router.post('/', postJob);
router.post('/apply', applyJob);
router.get('/nearby', getNearbyJobs);

export default router;
