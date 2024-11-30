import bcrypt from 'bcryptjs';
import { initializeDatabase } from '../config/db.js';

const initializeData = async () => {
  try {
    const db = await initializeDatabase();
    
    // إنشاء المدير الرئيسي
    const adminPassword = await bcrypt.hash('admin123', 10);
    await db.run(`
      INSERT OR IGNORE INTO employees (name, email, password, role, department, gender)
      VALUES ('Admin User', 'admin@example.com', ?, 'admin', 'Management', 'Male')
    `, [adminPassword]);

    // إضافة بعض الموظفين
    const employeePassword = await bcrypt.hash('employee123', 10);
    const employees = [
      ['John Doe', 'john@example.com', employeePassword, 'employee', 'IT', 'Male'],
      ['Jane Smith', 'jane@example.com', employeePassword, 'employee', 'HR', 'Female'],
      ['Mike Johnson', 'mike@example.com', employeePassword, 'employee', 'Sales', 'Male'],
      ['Sarah Wilson', 'sarah@example.com', employeePassword, 'employee', 'Marketing', 'Female']
    ];

    for (const [name, email, password, role, department, gender] of employees) {
      await db.run(`
        INSERT OR IGNORE INTO employees (name, email, password, role, department, gender)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [name, email, password, role, department, gender]);
    }

    // إضافة بعض المهام
    const tasks = [
      ['Weekly Meeting', 'Team status update', 'Conference Room A', '2024-03-20 10:00:00', '2024-03-20 11:00:00', 1],
      ['Project Review', 'Review Q1 progress', 'Meeting Room B', '2024-03-21 14:00:00', '2024-03-21 15:30:00', 2],
      ['Training Session', 'New software training', 'Training Room', '2024-03-22 09:00:00', '2024-03-22 12:00:00', 3],
      ['Client Meeting', 'Discuss new requirements', 'Board Room', '2024-03-23 11:00:00', '2024-03-23 12:00:00', 4]
    ];

    for (const [title, description, location, start_time, end_time, employee_id] of tasks) {
      await db.run(`
        INSERT OR IGNORE INTO scheduled_tasks (title, description, location, start_time, end_time, employee_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [title, description, location, start_time, end_time, employee_id]);
    }

    console.log('Initial data has been created successfully');
  } catch (error) {
    console.error('Error initializing data:', error);
  }
};

// تشغيل التهيئة
initializeData();
