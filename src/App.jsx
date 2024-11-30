import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/admin/Dashboard';
import EmployeeTable from './pages/admin/EmployeeTable';
import Profile from './pages/employee/Profile';
import Schedule from './pages/employee/Schedule';
import Tasks from './pages/employee/Tasks';
import TaskManagement from './pages/admin/TaskManagement'; // Added import statement
import TaskSchedule from './pages/admin/TaskSchedule';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <PrivateRoute requiredRole="admin">
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/employees"
                element={
                  <PrivateRoute requiredRole="admin">
                    <EmployeeTable />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/schedule"
                element={
                  <PrivateRoute requiredRole="admin">
                    <TaskSchedule />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/tasks"
                element={
                  <PrivateRoute requiredRole="admin">
                    <TaskManagement />
                  </PrivateRoute>
                }
              />

              {/* Employee Routes */}
              <Route
                path="/employee/profile"
                element={
                  <PrivateRoute requiredRole="employee">
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/employee/schedule"
                element={
                  <PrivateRoute requiredRole="employee">
                    <Schedule />
                  </PrivateRoute>
                }
              />
              <Route
                path="/employee/tasks"
                element={
                  <PrivateRoute requiredRole="employee">
                    <Tasks />
                  </PrivateRoute>
                }
              />

              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;