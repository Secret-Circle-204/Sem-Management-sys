import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { login as apiLogin, register as apiRegister } from '../services/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiLogin(email, password);
      const userData = {
        ...response.user,
        token: response.token
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      navigate(userData.role === 'admin' ? '/admin/dashboard' : '/employee/profile');
    } catch (error) {
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const userData = await apiRegister(name, email, password);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      navigate('/employee/profile');
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};