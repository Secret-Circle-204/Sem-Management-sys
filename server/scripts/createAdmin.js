import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { initializeDatabase } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const createAdmin = async () => {
  try {
    const db = await initializeDatabase();
    
    // Admin credentials
    const adminData = {
      name: 'System Admin',
      email: 'admin@system.com',
      password: 'Admin@123456',
      role: 'admin'
    };

    // Check if admin already exists
    const existingAdmin = await db.get('SELECT * FROM employees WHERE email = ?', [adminData.email]);
    if (existingAdmin) {
      console.log('Admin account already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Create admin user
    const result = await db.run(
      'INSERT INTO employees (name, email, password, role) VALUES (?, ?, ?, ?)',
      [adminData.name, adminData.email, hashedPassword, adminData.role]
    );

    // Generate permanent token (no expiration)
    const token = jwt.sign(
      { 
        id: result.lastID, 
        email: adminData.email, 
        role: adminData.role 
      },
      JWT_SECRET
    );

    console.log('Admin account created successfully');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('Permanent Token:', token);
    
  } catch (error) {
    console.error('Error creating admin:', error);
  }
};

// Run the function
createAdmin();
