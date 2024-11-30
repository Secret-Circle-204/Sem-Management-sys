import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { initializeDatabase } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const register = async (req, res) => {
  try {
    const db = await initializeDatabase();
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await db.get('SELECT * FROM employees WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.run(
      'INSERT INTO employees (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'employee']
    );

    const user = await db.get('SELECT id, name, email, role FROM employees WHERE id = ?', [result.lastID]);
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

export const login = async (req, res) => {
  try {
    const db = await initializeDatabase();
    const { email, password } = req.body;

    // Find user
    const user = await db.get('SELECT * FROM employees WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};