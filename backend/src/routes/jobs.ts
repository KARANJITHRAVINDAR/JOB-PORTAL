import { Router } from 'express';
import { postJob, applyJob, getNearbyJobs, getEmployerJobs, acceptApplication, rejectApplication, getSeekerApplications, editJob, completeJob } from '../controllers/jobs';
import { getSurgeEstimate } from '../controllers/surge';
import { clockIn } from '../controllers/attendance';

const router = Router();

router.post('/', postJob);
router.post('/apply', applyJob);
router.get('/nearby', getNearbyJobs);
router.get('/surge-estimate', getSurgeEstimate);
router.get('/employer/:employerId', getEmployerJobs);
router.put('/:id', editJob);
router.put('/:id/complete', completeJob);
router.post('/accept', acceptApplication);
router.post('/reject', rejectApplication);
router.post('/clock-in', clockIn);
router.get('/seeker/:workerId', getSeekerApplications);

export default router;
