import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, isAuthenticated, getCurrentUser, logout } from './api';

interface User {
  id: string;
  name: string;
  role: string;
  district?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, role: string, district?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Create the Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing user session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          const userData = getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
        // Clear invalid auth data
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login method
  const handleLogin = async (username: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.login({
        name: username,
        password: password
      });

      setUser(response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register method
  const handleRegister = async (username: string, password: string, role: string, district?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.register({
        name: username,
        password,
        role,
        district
      });

      setUser(response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout method
  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
  };

  // Clear error
  const clearError = () => setError(null);

  // Context value
  const value = {
    user,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext; 