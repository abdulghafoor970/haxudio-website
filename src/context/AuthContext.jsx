'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => authService.getStoredAdmin());
  const [token, setToken] = useState(() => authService.getToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      if (authService.isAuthenticated()) {
        try {
          const profile = await authService.getMe();
          if (isMounted) {
            if (profile) {
              setAdmin(profile);
              setToken(authService.getToken());
            } else {
              setAdmin(null);
              setToken(null);
            }
          }
        } catch {
          if (isMounted) {
            setAdmin(null);
            setToken(null);
          }
        }
      } else {
        if (isMounted) {
          setAdmin(null);
          setToken(null);
        }
      }
      if (isMounted) {
        setIsLoading(false);
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setAdmin(data.admin);
    setToken(data.token);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setAdmin(null);
    setToken(null);
  };

  const value = {
    admin,
    token,
    isAuthenticated: Boolean(token && admin),
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
