import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db = null;

export const initializeDatabase = async () => {
  if (db) {
    return db;
  }

  try {
    // استخدام قاعدة بيانات في الذاكرة في بيئة Vercel
    const isVercel = process.env.VERCEL === '1';
    const dbPath = isVercel ? ':memory:' : join(__dirname, '../../database.sqlite');

    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log('Database initialized successfully at:', dbPath);

    // إنشاء الجداول
    await db.exec(`
      CREATE TABLE IF NOT EXISTS scheduled_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        location TEXT NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        employee_id INTEGER,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
      )
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        role TEXT DEFAULT 'employee',
        department TEXT,
        gender TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // إضافة بيانات أولية في بيئة Vercel
    if (isVercel) {
      try {
        // التحقق من وجود الموظفين
        const employees = await db.all('SELECT * FROM employees');
        if (employees.length === 0) {
          // إنشاء كلمة مرور مشفرة
          const hashedPassword = await bcrypt.hash('admin123', 10);
          
          // إضافة موظف افتراضي
          await db.run(`
            INSERT INTO employees (name, email, password, role, department, gender)
            VALUES (?, ?, ?, ?, ?, ?)
          `, ['Admin User', 'admin@example.com', hashedPassword, 'admin', 'Management', 'male']);
          
          console.log('Default admin user created successfully');
        }
      } catch (error) {
        console.error('Error creating default admin:', error);
      }
    }

    await db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        employee_id INTEGER,
        due_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id)
      )
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER,
        start_time TEXT,
        end_time TEXT,
        FOREIGN KEY (employee_id) REFERENCES employees(id)
      )
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS time_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER,
        clock_in DATETIME,
        clock_out DATETIME,
        total_hours FLOAT,
        FOREIGN KEY (employee_id) REFERENCES employees(id)
      )
    `);

    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};