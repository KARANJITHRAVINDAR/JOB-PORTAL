import { Router } from 'express';
import { postJob, applyJob, getNearbyJobs, getEmployerJobs, acceptApplication, getSeekerApplications } from '../controllers/jobs';

const router = Router();

router.post('/', postJob);
router.post('/apply', applyJob);
router.get('/nearby', getNearbyJobs);
router.get('/employer/:employerId', getEmployerJobs);
router.post('/accept', acceptApplication);
router.get('/seeker/:workerId', getSeekerApplications);

export default router;
