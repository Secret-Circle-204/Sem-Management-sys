import { initializeDatabase } from '../config/db.js';

export const up = async () => {
  const db = await initializeDatabase();
  
  // تحديث جدول schedules
  await db.exec(`
    PRAGMA foreign_keys=off;
    
    BEGIN TRANSACTION;
    
    -- إنشاء جدول مؤقت بالهيكل الجديد
    CREATE TABLE IF NOT EXISTS schedules_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      day_of_week INTEGER DEFAULT 0,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );
    
    -- نقل البيانات من الجدول القديم إلى الجديد
    INSERT OR IGNORE INTO schedules_new (id, employee_id, start_time, end_time)
    SELECT id, employee_id, start_time, end_time FROM schedules;
    
    -- حذف الجدول القديم
    DROP TABLE IF EXISTS schedules;
    
    -- إعادة تسمية الجدول الجديد
    ALTER TABLE schedules_new RENAME TO schedules;
    
    COMMIT;
    
    PRAGMA foreign_keys=on;
  `);
  
  console.log('Migration: Updated schedules table structure');
};

export const down = async () => {
  console.log('Migration: No down migration needed for schedules update');
};
