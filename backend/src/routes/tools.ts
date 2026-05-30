import { Router } from 'express';
import { getAvailableTools, postTool, rentTool } from '../controllers/tools';

const router = Router();

router.get('/', getAvailableTools);
router.post('/', postTool);
router.post('/rent', rentTool);

export default router;
