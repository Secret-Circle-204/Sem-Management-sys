import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const up = async () => {
  const db = await open({
    filename: join(__dirname, '../../../database.sqlite'),
    driver: sqlite3.Database
  });
  
  // إنشاء جدول المهام المجدولة
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
};

export const down = async () => {
  const db = await open({
    filename: join(__dirname, '../../../database.sqlite'),
    driver: sqlite3.Database
  });
  await db.exec('DROP TABLE IF EXISTS scheduled_tasks');
};
