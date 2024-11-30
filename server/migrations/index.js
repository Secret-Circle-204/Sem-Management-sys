import { initializeDatabase } from '../config/db.js';
import * as migration001 from './001_add_department_column.js';
import * as migration002 from './002_update_schedules.js';

const migrations = [
  migration001,
  migration002
];

export const runMigrations = async () => {
  const db = await initializeDatabase();
  
  // إنشاء جدول لتتبع الترحيلات
  await db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // تنفيذ الترحيلات التي لم يتم تنفيذها من قبل
  for (let i = 0; i < migrations.length; i++) {
    const migrationName = `migration_${(i + 1).toString().padStart(3, '0')}`;
    const executed = await db.get('SELECT * FROM migrations WHERE name = ?', [migrationName]);
    
    if (!executed) {
      console.log(`Running migration: ${migrationName}`);
      await migrations[i].up();
      await db.run('INSERT INTO migrations (name) VALUES (?)', [migrationName]);
      console.log(`Completed migration: ${migrationName}`);
    }
  }
  
  console.log('All migrations completed successfully');
};
