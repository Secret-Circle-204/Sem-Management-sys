import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/employee/profile'} replace />;
  }

  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.oneOf(['admin', 'employee'])
};

export default PrivateRoute;