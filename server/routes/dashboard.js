import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', authenticateToken, isAdmin, getDashboardStats);

export default router;
