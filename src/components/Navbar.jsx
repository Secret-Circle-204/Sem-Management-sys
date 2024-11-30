import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Users, Calendar, ClipboardList, LayoutDashboard, CalendarCheck } from 'lucide-react';
import PropTypes from 'prop-types';

const NavLink = ({ to, active, children }) => (
  <Link
    to={to}
    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
      active
        ? 'border-b-2 border-blue-500 text-gray-900'
        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
  >
    {children}
  </Link>
);

NavLink.propTypes = {
  to: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to={isAdmin ? '/admin/dashboard' : '/employee/profile'} className="text-xl font-bold text-gray-800">
                SEM-EMS-Management
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {isAdmin ? (
                <>
                  <NavLink to="/admin/dashboard" active={isActive('/admin/dashboard')}>
                    <LayoutDashboard className="w-5 h-5 mr-2" />
                    Dashboard
                  </NavLink>
                  <NavLink to="/admin/employees" active={isActive('/admin/employees')}>
                    <Users className="w-5 h-5 mr-2" />
                    Employees
                  </NavLink>
                  <NavLink to="/admin/schedule" active={isActive('/admin/schedule')}>
                    <CalendarCheck className="w-5 h-5 mr-2" />
                    Schedule
                  </NavLink>
                  <NavLink to="/admin/tasks" active={isActive('/admin/tasks')}>
                    <ClipboardList className="w-5 h-5 mr-2" />
                    Tasks
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/employee/profile" active={isActive('/employee/profile')}>
                    Profile
                  </NavLink>
                  <NavLink to="/employee/schedule" active={isActive('/employee/schedule')}>
                    <Calendar className="w-5 h-5 mr-2" />
                    Schedule
                  </NavLink>
                  <NavLink to="/employee/tasks" active={isActive('/employee/tasks')}>
                    <ClipboardList className="w-5 h-5 mr-2" />
                    Tasks
                  </NavLink>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={logout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:text-gray-700"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;