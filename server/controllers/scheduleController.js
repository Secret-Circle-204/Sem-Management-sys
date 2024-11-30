import { initializeDatabase } from '../config/db.js';

export const getAllScheduledTasks = async (req, res) => {
  try {
    const db = await initializeDatabase();
    const { employee_id } = req.query;

    let query = `
      SELECT 
        scheduled_tasks.*,
        employees.name as employee_name,
        employees.department as employee_department,
        CASE 
          WHEN datetime('now') > datetime(end_time) THEN 'completed'
          WHEN datetime('now') BETWEEN datetime(start_time) AND datetime(end_time) THEN 'ongoing'
          ELSE 'upcoming'
        END as status
      FROM scheduled_tasks
      LEFT JOIN employees ON scheduled_tasks.employee_id = employees.id
    `;

    const params = [];
    
    // إذا تم تحديد موظف معين، نجلب فقط المهام الخاصة به
    if (employee_id) {
      query += ' WHERE scheduled_tasks.employee_id = ?';
      params.push(employee_id);
    }

    query += `
      ORDER BY 
        CASE 
          WHEN status = 'ongoing' THEN 1
          WHEN status = 'upcoming' THEN 2
          ELSE 3
        END,
        start_time ASC
    `;

    const tasks = await db.all(query, params);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching scheduled tasks:', error);
    res.status(500).json({ message: 'Error fetching scheduled tasks' });
  }
};

// إضافة وظيفة مساعدة لإنشاء جدول task_assignments إذا لم يكن موجوداً
export const initializeTaskAssignments = async (db) => {
  try {
    await db.run(`
      CREATE TABLE IF NOT EXISTS task_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL,
        employee_id INTEGER NOT NULL,
        FOREIGN KEY (task_id) REFERENCES scheduled_tasks(id),
        FOREIGN KEY (employee_id) REFERENCES employees(id)
      )
    `);
  } catch (error) {
    console.error('Error creating task_assignments table:', error);
  }
};

export const createScheduledTask = async (req, res) => {
  try {
    const db = await initializeDatabase();
    const { title, description, location, employee_id, start_time, end_time } = req.body;

    // التحقق من وجود الموظف أولاً
    const employee = await db.get('SELECT id, name FROM employees WHERE id = ?', [employee_id]);
    if (!employee) {
      return res.status(400).json({ message: 'Employee not found' });
    }

    // التحقق من تداخل المواعيد للموظف
    const overlappingTasks = await db.all(`
      SELECT * FROM scheduled_tasks 
      WHERE employee_id = ? 
      AND (
        (start_time BETWEEN ? AND ?) OR
        (end_time BETWEEN ? AND ?) OR
        (start_time <= ? AND end_time >= ?)
      )
    `, [employee_id, start_time, end_time, start_time, end_time, start_time, end_time]);

    if (overlappingTasks.length > 0) {
      return res.status(400).json({ 
        message: 'Employee already has a task scheduled during this time period' 
      });
    }

    const result = await db.run(`
      INSERT INTO scheduled_tasks (
        title, description, location, employee_id, start_time, end_time
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [title, description, location, employee_id, start_time, end_time]);

    // جلب المهمة الجديدة مع اسم الموظف
    const newTask = await db.get(`
      SELECT 
        scheduled_tasks.*,
        employees.name as employee_name
      FROM scheduled_tasks
      LEFT JOIN employees ON scheduled_tasks.employee_id = employees.id
      WHERE scheduled_tasks.id = ?
    `, [result.lastID]);

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating scheduled task:', error);
    res.status(500).json({ message: 'Error creating scheduled task' });
  }
};

// إضافة وظيفة للتحقق من جدول الموظفين
const checkEmployeesTable = async (db) => {
  try {
    const employees = await db.all('SELECT * FROM employees');
    console.log('All employees in database:', employees);
    return employees;
  } catch (error) {
    console.error('Error checking employees table:', error);
    return [];
  }
};

export const updateScheduledTask = async (req, res) => {
  try {
    console.log('Updating task with ID:', req.params.id);
    console.log('Update data received:', req.body);

    const db = await initializeDatabase();
    
    // التحقق من جدول الموظفين
    console.log('Checking employees table...');
    const allEmployees = await checkEmployeesTable(db);
    if (allEmployees.length === 0) {
      console.error('No employees found in database');
      return res.status(500).json({ message: 'Error: No employees found in database' });
    }

    const { id } = req.params;
    const { title, description, location, employee_id, start_time, end_time } = req.body;

    // التحقق من وجود الموظف أولاً
    const employee = await db.get('SELECT id, name FROM employees WHERE id = ?', [employee_id]);
    console.log('Found employee:', employee);

    if (!employee) {
      console.log('Employee not found:', employee_id);
      return res.status(400).json({ message: 'Employee not found' });
    }

    // تحديث المهمة
    const updateResult = await db.run(`
      UPDATE scheduled_tasks 
      SET title = ?, 
          description = ?, 
          location = ?, 
          employee_id = ?, 
          start_time = ?, 
          end_time = ?
      WHERE id = ?
    `, [title, description, location, employee_id, start_time, end_time, id]);

    console.log('Update result:', updateResult);

    // جلب المهمة المحدثة مع معلومات الموظف
    const updatedTask = await db.get(`
      SELECT 
        t.id,
        t.title,
        t.description,
        t.location,
        t.employee_id,
        t.start_time,
        t.end_time,
        e.name as employee_name
      FROM scheduled_tasks t
      LEFT JOIN employees e ON e.id = t.employee_id
      WHERE t.id = ?
    `, [id]);

    console.log('Raw updated task from database:', updatedTask);

    if (!updatedTask) {
      console.log('Task not found after update');
      return res.status(404).json({ message: 'Task not found after update' });
    }

    // التحقق من وجود جميع البيانات المطلوبة
    if (!updatedTask.employee_name) {
      console.error('Employee name missing in updated task. Task:', updatedTask);
      console.error('Employee ID from request:', employee_id);
      
      // محاولة جلب الموظف مباشرة
      const employeeCheck = await db.get('SELECT id, name FROM employees WHERE id = ?', [employee_id]);
      console.log('Direct employee check:', employeeCheck);
      
      // إضافة اسم الموظف يدوياً إذا وجدناه
      if (employeeCheck && employeeCheck.name) {
        updatedTask.employee_name = employeeCheck.name;
      } else {
        return res.status(500).json({ message: 'Error retrieving employee information' });
      }
    }

    // تنسيق البيانات النهائية
    const finalResponse = {
      ...updatedTask,
      employee_name: updatedTask.employee_name
    };

    console.log('Final response:', finalResponse);
    res.json(finalResponse);
  } catch (error) {
    console.error('Error updating scheduled task:', error);
    res.status(500).json({ message: 'Error updating scheduled task' });
  }
};

export const deleteScheduledTask = async (req, res) => {
  try {
    const db = await initializeDatabase();
    const { id } = req.params;

    await db.run('DELETE FROM scheduled_tasks WHERE id = ?', [id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting scheduled task:', error);
    res.status(500).json({ message: 'Error deleting scheduled task' });
  }
};
