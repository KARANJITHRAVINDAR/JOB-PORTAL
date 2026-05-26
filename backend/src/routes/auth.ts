import { Router } from 'express';
import { register, login, updateProfile, getUser, getNearbyWorkers } from '../controllers/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.put('/profile', updateProfile);
router.get('/user/:id', getUser);
router.get('/workers/nearby', getNearbyWorkers);

export default router;
