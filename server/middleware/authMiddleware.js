import jwt from 'jsonwebtoken';
import { initializeDatabase } from '../config/db.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, 'your_jwt_secret');

      // Get user from database
      const db = await initializeDatabase();
      const user = await db.get(
        'SELECT id, name, email, role FROM employees WHERE id = ?',
        [decoded.id]
      );

      if (!user) {
        res.status(401).json({ message: 'Not authorized' });
        return;
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth error:', error);
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
    return;
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as admin' });
  }
};
