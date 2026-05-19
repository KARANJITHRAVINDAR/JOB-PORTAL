import { Router } from 'express';
import { getNotifications, markAsRead } from '../controllers/notifications';

const router = Router();

router.get('/:userId', getNotifications);
router.put('/:notificationId/read', markAsRead);

export default router;
