import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { disconnectSocket } from '../services/socketService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from stored token
  useEffect(() => {
    const token = localStorage.getItem('careerbridge_token');
    if (token) {
      api
        .get('/auth/me')
        .then((res) => {
          setUser(res.user);
        })
        .catch(() => {
          localStorage.removeItem('careerbridge_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user: loggedUser } = response;
    localStorage.setItem('careerbridge_token', token);
    setUser(loggedUser);
    const rolePath = loggedUser.role.toLowerCase();
    navigate(`/${rolePath}`, { replace: true });
    return loggedUser;
  };

  const demoLogin = async (role) => {
    const response = await api.post('/auth/demo-login', { role });
    const { token, user: loggedUser } = response;
    localStorage.setItem('careerbridge_token', token);
    setUser(loggedUser);
    const rolePath = loggedUser.role.toLowerCase();
    navigate(`/${rolePath}`, { replace: true });
    return loggedUser;
  };

  const logout = () => {
    disconnectSocket();
    localStorage.removeItem('careerbridge_token');
    setUser(null);
    navigate('/login', { replace: true });
  };

  const value = { user, loading, login, demoLogin, logout, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
