import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [token, setToken] = useState(authService.getToken());
  const [loading, setLoading] = useState(true);

  // Verify stored user on initial load
  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = authService.getToken();
      if (storedToken) {
        try {
          const profile = await authService.getMe();
          if (profile && profile.success) {
            setUser((prev) => ({
              ...prev,
              ...profile,
            }));
          }
        } catch (error) {
          console.error('Session expired or invalid token:', error.message);
          authService.logout();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  // Login handler
  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await authService.login(credentials);
      setUser(data);
      setToken(data.token);
      setLoading(false);
      return { success: true, data };
    } catch (error) {
      setLoading(false);
      const message =
        error.response?.data?.message || error.message || 'Login failed. Please check credentials.';
      return { success: false, error: message };
    }
  };

  // Register handler
  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await authService.register(userData);
      setUser(data);
      setToken(data.token);
      setLoading(false);
      return { success: true, data };
    } catch (error) {
      setLoading(false);
      const message =
        error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      return { success: false, error: message };
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const data = await authService.forgotPassword(email);
      return { success: true, data };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to request password reset.';
      return { success: false, error: message };
    }
  };

  // Reset password
  const resetPassword = async (resetToken, newPassword) => {
    setLoading(true);
    try {
      const data = await authService.resetPassword(resetToken, newPassword);
      setUser(data);
      setToken(data.token);
      setLoading(false);
      return { success: true, data };
    } catch (error) {
      setLoading(false);
      const message =
        error.response?.data?.message || error.message || 'Failed to reset password.';
      return { success: false, error: message };
    }
  };

  // Logout handler
  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to access auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
