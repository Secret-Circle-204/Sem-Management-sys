import { initializeDatabase } from '../config/db.js';
import bcryptjs from 'bcryptjs';

export const getAllEmployees = async (req, res) => {
  try {
    const db = await initializeDatabase();
    const { search, department, gender, sortBy, sortOrder } = req.query;

    let query = `
      SELECT 
        employees.*,
        COUNT(DISTINCT scheduled_tasks.id) as task_count
      FROM employees
      LEFT JOIN scheduled_tasks ON employees.id = scheduled_tasks.employee_id
    `;

    const whereConditions = [];
    const params = [];

    if (search) {
      whereConditions.push(`(
        employees.name LIKE ? OR 
        employees.email LIKE ? OR 
        employees.phone LIKE ? OR 
        employees.department LIKE ?
      )`);
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (department) {
      whereConditions.push('employees.department = ?');
      params.push(department);
    }

    if (gender) {
      whereConditions.push('employees.gender = ?');
      params.push(gender);
    }

    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    // إضافة GROUP BY لتجميع المهام لكل موظف
    query += ' GROUP BY employees.id';

    // إضافة الترتيب
    if (sortBy === 'created_date') {
      query += ` ORDER BY employees.created_at ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
    } else if (sortBy === 'task_count') {
      query += ` ORDER BY task_count ${sortOrder === 'desc' ? 'DESC' : 'ASC'}, employees.created_at DESC`;
    } else {
      query += ' ORDER BY employees.created_at DESC';
    }

    const employees = await db.all(query, params);
    res.json(employees);
  } catch (error) {
    console.error('Error getting employees:', error);
    res.status(500).json({ message: 'Error getting employees' });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const db = await initializeDatabase();
    const employee = await db.get(`
      SELECT 
        employees.*,
        schedules.start_time,
        schedules.end_time
      FROM employees 
      LEFT JOIN schedules ON employees.id = schedules.employee_id
      WHERE employees.id = ?
    `, [req.params.id]);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Error fetching employee' });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const db = await initializeDatabase();
    const { id } = req.params;
    const { name, email, gender, phone, job_title, department, start_time, end_time } = req.body;

    // تحديث بيانات الموظف
    await db.run(
      `UPDATE employees 
       SET name = ?, email = ?, gender = ?, phone = ?, job_title = ?, department = ?
       WHERE id = ?`,
      [name, email, gender, phone, job_title, department, id]
    );

    // تحديث ساعات العمل
    const existingSchedule = await db.get('SELECT * FROM schedules WHERE employee_id = ?', [id]);
    if (existingSchedule) {
      await db.run(
        'UPDATE schedules SET start_time = ?, end_time = ? WHERE employee_id = ?',
        [start_time, end_time, id]
      );
    } else {
      await db.run(
        'INSERT INTO schedules (employee_id, start_time, end_time) VALUES (?, ?, ?)',
        [id, start_time, end_time]
      );
    }

    // جلب البيانات المحدثة
    const updatedEmployee = await db.get(`
      SELECT 
        employees.*,
        schedules.start_time,
        schedules.end_time
      FROM employees 
      LEFT JOIN schedules ON employees.id = schedules.employee_id
      WHERE employees.id = ?
    `, [id]);

    res.json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Error updating employee' });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const db = await initializeDatabase();
    const { name, email, password, gender, phone, job_title, department, start_time, end_time } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // التحقق من صحة مواعيد العمل
    if (start_time && end_time) {
      const startHour = parseInt(start_time.split(':')[0]);
      const endHour = parseInt(end_time.split(':')[0]);
      if (startHour >= endHour) {
        return res.status(400).json({ message: 'Start time must be before end time' });
      }
    }

    // التحقق من عدم وجود البريد الإلكتروني مسبقاً
    const existingEmployee = await db.get('SELECT * FROM employees WHERE email = ?', [email]);
    if (existingEmployee) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // تشفير كلمة المرور
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // إضافة الموظف إلى جدول employees
    const result = await db.run(
      `INSERT INTO employees (
        name, email, password, gender, phone, job_title, department, role
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, gender, phone, job_title, department, 'employee']
    );

    // إضافة ساعات العمل إلى جدول schedules
    if (start_time && end_time) {
      await db.run(
        'INSERT INTO schedules (employee_id, start_time, end_time) VALUES (?, ?, ?)',
        [result.lastID, start_time, end_time]
      );
    }

    // جلب بيانات الموظف مع ساعات العمل
    const newEmployee = await db.get(`
      SELECT 
        employees.*,
        schedules.start_time,
        schedules.end_time
      FROM employees 
      LEFT JOIN schedules ON employees.id = schedules.employee_id
      WHERE employees.id = ?
    `, [result.lastID]);

    res.status(201).json(newEmployee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Error creating employee: ' + error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const db = await initializeDatabase();
    const { id } = req.params;

    // التحقق من وجود الموظف
    const employee = await db.get('SELECT * FROM employees WHERE id = ?', [id]);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // بدء المعاملة
    await db.run('BEGIN TRANSACTION');

    try {
      // حذف جميع المهام المرتبطة بالموظف
      await db.run('DELETE FROM tasks WHERE employee_id = ?', [id]);
      
      // حذف جدول المواعيد المرتبط بالموظف
      await db.run('DELETE FROM schedules WHERE employee_id = ?', [id]);
      
      // حذف سجلات الوقت المرتبطة بالموظف
      await db.run('DELETE FROM time_logs WHERE employee_id = ?', [id]);
      
      // حذف الموظف
      await db.run('DELETE FROM employees WHERE id = ?', [id]);
      
      // إتمام المعاملة
      await db.run('COMMIT');
      
      res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
      // التراجع عن المعاملة في حالة حدوث خطأ
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Error deleting employee' });
  }
};