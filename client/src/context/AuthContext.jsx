import { createContext, useContext, useState, useCallback } from 'react';
import * as api from '../services/api';

const TOKEN_KEY = 'priceradar_token';
const USER_KEY = 'priceradar_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize from localStorage so a page refresh doesn't log the user out.
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const persist = (nextToken, nextUser) => {
    if (nextToken) {
      localStorage.setItem(TOKEN_KEY, nextToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    if (nextUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(USER_KEY);
    }
    setToken(nextToken);
    setUser(nextUser);
  };

  const login = useCallback(async ({ email, password }) => {
    // api.login returns { token, user: { id, name, email } }
    const data = await api.login({ email, password });
    persist(data.token, data.user);
    return data.user;
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    // api.register returns { user: { id, name, email } }
    const data = await api.register({ name, email, password });
    return data.user;
  }, []);

  const logout = useCallback(() => {
    persist(null, null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth() must be called inside an <AuthProvider>');
  }
  return ctx;
}
