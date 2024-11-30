import { initializeDatabase } from '../config/db.js';

export const up = async () => {
  const db = await initializeDatabase();
  
  // إضافة عمود department إذا لم يكن موجوداً
  await db.exec(`
    PRAGMA foreign_keys=off;
    
    BEGIN TRANSACTION;
    
    ALTER TABLE employees ADD COLUMN department TEXT;
    
    COMMIT;
    
    PRAGMA foreign_keys=on;
  `).catch(err => {
    if (!err.message.includes('duplicate column name')) {
      throw err;
    }
  });
  
  console.log('Migration: Added department column to employees table');
};

export const down = async () => {
  // SQLite لا يدعم حذف الأعمدة مباشرة
  console.log('Migration: Cannot remove column in SQLite');
};
