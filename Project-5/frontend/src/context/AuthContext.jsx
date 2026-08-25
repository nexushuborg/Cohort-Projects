import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, extractError } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await authAPI.getMe();
        if (data.success) {
          setUser(data.data);
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const { data } = await authAPI.login({ email, password });
      if (data.success) {
        const { user: userData, accessToken, refreshToken } = data.data;
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        setUser(userData);
        return { success: true };
      }
      return { success: false, message: data.error?.message || 'Login failed' };
    } catch (err) {
      const extracted = extractError(err);
      setError(extracted.message);
      return { success: false, message: extracted.message, fieldErrors: extracted.fieldErrors };
    }
  }, []);

  const register = useCallback(async (userData) => {
    setError(null);
    try {
      const { data } = await authAPI.register(userData);
      if (data.success) {
        const { user: newUser, accessToken, refreshToken } = data.data;
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        setUser(newUser);
        return { success: true };
      }
      return { success: false, message: data.error?.message || 'Registration failed' };
    } catch (err) {
      const extracted = extractError(err);
      setError(extracted.message);
      return { success: false, message: extracted.message, fieldErrors: extracted.fieldErrors };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
