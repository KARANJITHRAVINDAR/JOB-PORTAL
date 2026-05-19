import { Router } from 'express';
import { register, login, updateProfile, getUser } from '../controllers/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.put('/profile', updateProfile);
router.get('/user/:id', getUser);

export default router;
