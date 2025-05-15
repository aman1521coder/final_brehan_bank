import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { authAPI } from '../services/api';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Try a ping test first to check connectivity
      try {
        const pingResponse = await fetch('http://localhost:8080/ping', {
          mode: 'cors',
          credentials: 'include'
        });
        
        if (!pingResponse.ok) {
          console.error('Ping test failed:', pingResponse.status);
        } else {
          console.log('Ping test successful');
        }
      } catch (pingError) {
        console.error('Ping connection test failed:', pingError);
      }
      
      // Proceed with login
      console.log('Attempting login for:', username);
      const response = await authAPI.login({ name: username, password });
      
      // Store token and user info
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Redirect based on role
      if (response.user.role === 'admin') {
        history.push('/admin/dashboard');
      } else {
        history.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      if (err.message && err.message.includes('Failed to fetch')) {
        setError('Could not connect to the server. Please check if the backend is running on port 8080.');
      } else if (err.message && err.message.includes('Invalid credentials')) {
        setError('Invalid username or password.');
      } else {
        setError(err.message || 'An error occurred during login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        
        {error && (
          <div className="error-message">
            {error}
            <button 
              className="error-close" 
              onClick={() => setError(null)}
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
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-footer">
          Don't have an account? <a href="/register">Register</a>
        </div>
      </div>
    </div>
  );
};

export default Login; 