import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/AuthContext';

const Login: React.FC = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, error: authError, clearError } = useAuth();

  // Clear errors when component mounts or unmounts
  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  // Update local error state when auth error changes
  useEffect(() => {
    if (authError) {
      setLocalError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);

    if (!name.trim() || !password.trim()) {
      setLocalError('Username and password are required');
      setLoading(false);
      return;
    }

    try {
      await login({ name, password });
      // Redirect is handled by App.tsx based on auth state
    } catch (err: any) {
      console.error('Login submission error:', err);
      setLocalError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        
        {localError && (
          <div className="error-message">
            {localError}
            <button className="error-close" onClick={() => setLocalError('')}>×</button>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Username</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="username"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Don't have an account? <a href="/register">Register</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 