import express from 'express';
import { getAllTasks, getEmployeeTasks, createTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Admin routes
router.get('/all', authenticateToken, isAdmin, getAllTasks);
router.get('/employee/:id', authenticateToken, isAdmin, getEmployeeTasks);
router.post('/', authenticateToken, isAdmin, createTask);
router.delete('/:id', authenticateToken, isAdmin, deleteTask);

// Employee routes
router.get('/', authenticateToken, (req, res) => getEmployeeTasks(req, res, req.user.id));
router.put('/:id', authenticateToken, updateTask);

export default router;