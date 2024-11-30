import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './config/db.js';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import taskRoutes from './routes/tasks.js';
import dashboardRoutes from './routes/dashboard.js';
import scheduleRoutes from './routes/schedule.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initializeDatabase().then(() => {
  console.log('Database initialized');
}).catch(err => {
  console.error('Database initialization error:', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/schedule', scheduleRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});