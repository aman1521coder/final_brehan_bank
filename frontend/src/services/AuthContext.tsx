import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define user interface
interface User {
  id: string;
  name: string;
  role: string;
  district?: string;
}

// Define authentication context interface
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (authResponse: { user: User, token: string }) => void;
  logout: () => void;
  clearError: () => void;
}

// Create the context with undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that wraps the app and makes auth available
export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing user session on mount
  useEffect(() => {
    // Check localStorage for user data
    const checkAuth = async () => {
      console.log('AuthContext: Checking for existing session');
      try {
        const storedToken = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        console.log('AuthContext: Found user in localStorage:', userStr ? 'yes' : 'no');
        console.log('AuthContext: Found token in localStorage:', storedToken ? 'yes' : 'no');
        
        if (userStr && storedToken) {
          const parsedUser = JSON.parse(userStr);
          console.log('AuthContext: Parsed user data:', parsedUser);
          setUser(parsedUser);
          setToken(storedToken);
        } else {
          console.log('AuthContext: No auth data found in localStorage');
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
        // Clear invalid auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        console.log('AuthContext: Setting loading to false');
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login method - store user data and token
  const login = (authResponse: { user: User, token: string }) => {
    console.log('AuthContext: Login called with auth data:', authResponse);
    setUser(authResponse.user);
    setToken(authResponse.token);
    
    // Store auth data in localStorage
    localStorage.setItem('user', JSON.stringify(authResponse.user));
    localStorage.setItem('token', authResponse.token);
    console.log('AuthContext: Auth data stored in localStorage');
  };

  // Logout method - clear user data
  const handleLogout = () => {
    console.log('AuthContext: Logout called');
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    console.log('AuthContext: Auth data cleared');
  };

  // Clear error
  const clearError = () => setError(null);

  // Context value
  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!(user && token),
    login,
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