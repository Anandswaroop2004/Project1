import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('mams_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('mams_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.data) {
            const userData = {
              id: res.data.id,
              username: res.data.username,
              fullName: res.data.fullName,
              militaryRank: res.data.militaryRank,
              serviceNumber: res.data.serviceNumber,
              email: res.data.email,
              role: res.data.role,
              baseId: res.data.base?.id || null,
              baseName: res.data.base?.name || 'Central Command',
              baseCode: res.data.base?.code || 'HQ-DOD',
            };
            setUser(userData);
            localStorage.setItem('mams_user', JSON.stringify(userData));
          }
        } catch (err) {
          console.error('Session expired or invalid token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (username, password) => {
    const res = await authApi.login({ username, password });
    if (res.success && res.data) {
      const authData = res.data;
      setToken(authData.token);
      localStorage.setItem('mams_token', authData.token);

      const userData = {
        id: authData.id,
        username: authData.username,
        fullName: authData.fullName,
        militaryRank: authData.militaryRank,
        serviceNumber: authData.serviceNumber,
        email: authData.email,
        role: authData.role,
        baseId: authData.baseId,
        baseName: authData.baseName || 'All Bases / Joint HQ',
        baseCode: authData.baseCode || 'HQ',
      };
      setUser(userData);
      localStorage.setItem('mams_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('mams_token');
    localStorage.removeItem('mams_user');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'ADMIN',
    isCommander: user?.role === 'BASE_COMMANDER',
    isLogistics: user?.role === 'LOGISTICS_OFFICER',
    userBaseId: user?.baseId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
