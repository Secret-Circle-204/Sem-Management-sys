import express from 'express';
import { getAllEmployees, getEmployeeById, updateEmployee, createEmployee, deleteEmployee } from '../controllers/employeeController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, isAdmin, getAllEmployees);
router.get('/:id', authenticateToken, getEmployeeById);
router.put('/:id', authenticateToken, updateEmployee);
router.post('/', authenticateToken, isAdmin, createEmployee);
router.delete('/:id', authenticateToken, isAdmin, deleteEmployee);

export default router;