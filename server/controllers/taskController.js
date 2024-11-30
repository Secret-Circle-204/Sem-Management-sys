import { initializeDatabase } from '../config/db.js';

export const getAllTasks = async (req, res) => {
  try {
    const db = await initializeDatabase();
    const tasks = await db.all(`
      SELECT tasks.*, employees.name as employee_name 
      FROM tasks 
      LEFT JOIN employees ON tasks.employee_id = employees.id 
      ORDER BY due_date ASC
    `);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching all tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

export const getEmployeeTasks = async (req, res) => {
  try {
    const db = await initializeDatabase();
    const { id } = req.params;
    const tasks = await db.all(`
      SELECT tasks.*, employees.name as employee_name 
      FROM tasks 
      LEFT JOIN employees ON tasks.employee_id = employees.id 
      WHERE employee_id = ? 
      ORDER BY due_date ASC
    `, [id]);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching employee tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

export const createTask = async (req, res) => {
  try {
    const db = await initializeDatabase();
    const { title, description, employee_id, due_date } = req.body;
    
    const result = await db.run(
      'INSERT INTO tasks (title, description, employee_id, due_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, employee_id, due_date, 'pending', new Date().toISOString()]
    );
    
    const newTask = await db.get(`
      SELECT tasks.*, employees.name as employee_name 
      FROM tasks 
      LEFT JOIN employees ON tasks.employee_id = employees.id 
      WHERE tasks.id = ?
    `, [result.lastID]);

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const db = await initializeDatabase();
    const { title, description, status, due_date } = req.body;
    const { id } = req.params;

    // Check if user is admin or the assigned employee
    const task = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role !== 'admin' && task.employee_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }
    
    await db.run(
      'UPDATE tasks SET title = ?, description = ?, status = ?, due_date = ?, updated_at = ? WHERE id = ?',
      [title, description, status, due_date, new Date().toISOString(), id]
    );
    
    const updatedTask = await db.get(`
      SELECT tasks.*, employees.name as employee_name 
      FROM tasks 
      LEFT JOIN employees ON tasks.employee_id = employees.id 
      WHERE tasks.id = ?
    `, [id]);

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const db = await initializeDatabase();
    const { id } = req.params;

    // Only admin can delete tasks
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete tasks' });
    }

    await db.run('DELETE FROM tasks WHERE id = ?', [id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Error deleting task' });
  }
};