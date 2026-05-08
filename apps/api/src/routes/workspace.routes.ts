import { Router } from 'express';
import { workspaceController } from '../controllers/workspace.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', workspaceController.getAll);
router.get('/:id', workspaceController.getById);
router.post('/', workspaceController.create);
router.patch('/:id', workspaceController.update);

export default router;
