import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { authAPI } from '../services/api';
import '../styles/Login.css';

// District options for district managers
const districtOptions = [
  'East District',
  'East Addis District',
  'West District',
  'West Addis District',
  'North District',
  'North Addis District',
  'South District',
  'South Addis District',
  'Central Ethiopia District'
];

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState({ 
    name: '', 
    password: '',
    role: 'manager', // Default role changed to manager
    district: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    
    // Clear district if role is not district_manager
    if (name === 'role' && value !== 'district_manager') {
      setCredentials(prev => ({ ...prev, district: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Only include district if role is district_manager
      const loginData = {
        name: credentials.name,
        password: credentials.password,
        role: credentials.role,
        ...(credentials.role === 'district_manager' && { district: credentials.district })
      };
      
      // Use the authAPI service instead of direct fetch
      const authResponse = await authAPI.login(loginData);
      
      // Login using the context function
      if (authResponse && authResponse.token && authResponse.user) {
        // Log in with the auth context
        login({
          user: authResponse.user,
          token: authResponse.token
        });
        
        // Redirect based on role
        if (authResponse.user.role === 'manager') {
          navigate('/manager/dashboard');
        } else if (authResponse.user.role === 'district_manager') {
          navigate('/district/dashboard');
        } else if (authResponse.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <div className="login-logo-container">
          <div className="login-logo"></div>
        </div>
      </header>

      <div className="login-container">
        <h1 className="login-title">Berhan Bank HR System</h1>
        <p className="login-subtitle">አንደስማችን ብርሀን ነው ሰራችን!</p>
        
        <div className="login-card">
          <h2>Login</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Username</label>
              <input
                type="text"
                id="name"
                name="name"
                value={credentials.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={credentials.role}
                onChange={handleChange}
                required
              >
                <option value="manager">Manager</option>
                <option value="district_manager">District Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            {credentials.role === 'district_manager' && (
              <div className="form-group district-selection">
                <label htmlFor="district">Your District</label>
                <p className="field-hint">Please select the district you are assigned to manage.</p>
                <select
                  id="district"
                  name="district"
                  value={credentials.district}
                  onChange={handleChange}
                  required
                  className="district-dropdown"
                >
                  <option value="">Select Your District</option>
                  <optgroup label="Addis Ababa">
                    <option value="East Addis District">East Addis District</option>
                    <option value="West Addis District">West Addis District</option>
                    <option value="North Addis District">North Addis District</option>
                    <option value="South Addis District">South Addis District</option>
                  </optgroup>
                  <optgroup label="Regional">
                    <option value="East District">East District</option>
                    <option value="West District">West District</option>
                    <option value="North District">North District</option>
                    <option value="South District">South District</option>
                    <option value="Central Ethiopia District">Central Ethiopia District</option>
                  </optgroup>
                </select>
                {credentials.district && (
                  <div className="district-preview">
                    <span className="district-label">Selected District:</span> {credentials.district}
                  </div>
                )}
              </div>
            )}
            
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>

      <footer className="login-footer">
        <p>© {new Date().getFullYear()} Berhan Bank. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Login; 