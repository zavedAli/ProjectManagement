import { Router } from 'express';
import { taskController } from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../lib/upload.js';

const router = Router();

router.use(authenticate);

router.get('/', taskController.getAll);
router.get('/:id', taskController.getById);
router.post('/', taskController.create);
router.patch('/:id', taskController.update);
router.delete('/:id', taskController.delete);
router.post('/:id/comments', taskController.addComment);
router.post('/:id/attachments', upload.single('file'), taskController.uploadAttachment);
router.delete('/attachments/:id', taskController.deleteAttachment);

export default router;
