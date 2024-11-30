import { initializeDatabase } from '../config/db.js';

export const getDashboardStats = async (req, res) => {
  try {
    const db = await initializeDatabase();
    
    // Get total employees (excluding admin)
    const totalEmployees = await db.get(
      'SELECT COUNT(*) as count FROM employees WHERE role = ?',
      ['employee']
    );

    // Get task statistics
    const taskStats = await db.all(`
      SELECT 
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedTasks,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingTasks,
        COUNT(CASE WHEN status = 'pending' AND due_date < date('now') THEN 1 END) as overdueTasks
      FROM tasks
    `);

    res.json({
      totalEmployees: totalEmployees.count,
      completedTasks: taskStats[0].completedTasks,
      pendingTasks: taskStats[0].pendingTasks,
      overdueTasks: taskStats[0].overdueTasks
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
};
