import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { publicAPI } from '../services/api';

const Login: React.FC = () => {
  const { login, error: authError, loading: authLoading, clearError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const history = useHistory();

  // Check backend status on component mount
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        await publicAPI.ping();
        setBackendStatus('online');
      } catch (err) {
        console.error('Backend connection check failed:', err);
        setBackendStatus('offline');
        setError('Could not connect to the server. Please check if the backend is running.');
      }
    };
    
    checkBackendStatus();
  }, []);

  // Update local error state when auth context error changes
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);
    clearError();
    
    // Don't attempt login if backend is offline
    if (backendStatus === 'offline') {
      setError('Cannot log in: Backend server is offline. Please check the server connection.');
      return;
    }

    try {
      // Call the login function from auth context
      await login(username, password);
      
      // Redirect user based on role (this could come from the auth context)
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        
        if (user.role === 'admin') {
          history.push('/admin/dashboard');
        } else if (user.role === 'manager') {
          history.push('/manager/dashboard');
        } else if (user.role === 'district_manager') {
          history.push('/district/dashboard');
        } else {
          history.push('/dashboard');
        }
      } else {
        // Fallback if user data isn't available for some reason
        history.push('/dashboard');
      }
    } catch (err) {
      // Error will be handled by auth context and displayed via the authError effect
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        
        {backendStatus === 'offline' && (
          <div className="warning-message">
            Backend server is offline. Please check if the server is running.
          </div>
        )}
        
        {error && (
          <div className="error-message">
            {error}
            <button 
              className="error-close" 
              onClick={() => {
                setError(null);
                clearError();
              }}
            >
              &times;
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={authLoading || backendStatus === 'offline'}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={authLoading || backendStatus === 'offline'}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={authLoading || backendStatus === 'offline'}
          >
            {authLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Need help? <a href="/contact">Contact support</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login; 