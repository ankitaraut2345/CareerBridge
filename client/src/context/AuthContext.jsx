import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { disconnectSocket } from '../services/socketService';
import {
  isSandboxActive,
  getSandboxSession,
  activateSandbox,
  clearSandbox,
} from '../services/demoSandboxService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isDemoSandbox, setIsDemoSandbox] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from stored token or sandbox session
  useEffect(() => {
    let token = localStorage.getItem('careerbridge_token');
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const queryToken = urlParams.get('token');
      if (queryToken) {
        token = queryToken;
        localStorage.setItem('careerbridge_token', queryToken);
      }
    } catch (e) {}

    // Priority 1: Real token in localStorage
    if (token) {
      api
        .get('/auth/me')
        .then((res) => {
          setUser(res.user);
          setIsDemoSandbox(false);
        })
        .catch(() => {
          localStorage.removeItem('careerbridge_token');
          setUser(null);
          setIsDemoSandbox(false);
        })
        .finally(() => setLoading(false));
      return;
    }

    // Priority 2: Isolated Demo Sandbox in sessionStorage
    if (isSandboxActive()) {
      const session = getSandboxSession();
      if (session && session.user) {
        setUser(session.user);
        setIsDemoSandbox(true);
        setLoading(false);
        return;
      }
    }

    // Unauthenticated
    setUser(null);
    setIsDemoSandbox(false);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    clearSandbox();
    setIsDemoSandbox(false);
    const response = await api.post('/auth/login', { email, password });
    const { token, user: loggedUser } = response;
    localStorage.setItem('careerbridge_token', token);
    setUser(loggedUser);
    const rolePath = loggedUser.role.toLowerCase();
    navigate(`/${rolePath}`, { replace: true });
    return loggedUser;
  };

  /**
   * Enter Isolated Demo Sandbox Mode for a specific role
   * Does NOT call backend /api/auth/demo-login or issue real JWTs.
   * State is stored only in sessionStorage.
   */
  const enterDemoSandbox = (role) => {
    const demoUser = activateSandbox(role);
    setUser(demoUser);
    setIsDemoSandbox(true);
    const rolePath = demoUser.role.toLowerCase();
    navigate(`/${rolePath}`, { replace: true });
    return demoUser;
  };

  /**
   * Exit Demo Sandbox Mode and return cleanly to login
   */
  const exitDemoSandbox = () => {
    clearSandbox();
    setIsDemoSandbox(false);
    setUser(null);
    navigate('/login', { replace: true });
  };

  const demoLogin = async (role) => {
    // Legacy fallback redirecting to safe sandbox
    return enterDemoSandbox(role);
  };

  const logout = () => {
    disconnectSocket();
    clearSandbox();
    setIsDemoSandbox(false);
    localStorage.removeItem('careerbridge_token');
    setUser(null);
    navigate('/login', { replace: true });
  };

  const value = {
    user,
    loading,
    login,
    demoLogin,
    enterDemoSandbox,
    exitDemoSandbox,
    isDemoSandbox,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
