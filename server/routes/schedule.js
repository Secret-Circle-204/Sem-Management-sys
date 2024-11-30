import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import {
  getAllScheduledTasks,
  createScheduledTask,
  updateScheduledTask,
  deleteScheduledTask
} from '../controllers/scheduleController.js';

const router = express.Router();

router.get('/', authenticateToken, getAllScheduledTasks);
router.post('/', authenticateToken, isAdmin, createScheduledTask);
router.put('/:id', authenticateToken, isAdmin, updateScheduledTask);
router.delete('/:id', authenticateToken, isAdmin, deleteScheduledTask);

export default router;
