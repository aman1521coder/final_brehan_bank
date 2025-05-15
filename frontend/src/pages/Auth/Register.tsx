import React, { useState } from 'react';
import { useAuth } from '../../services/AuthContext';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [district, setDistrict] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate district if role is district_manager
    if (role === 'district_manager' && !district) {
      setError('District is required for district managers');
      setLoading(false);
      return;
    }

    try {
      await register({ 
        name, 
        password, 
        role,
        ...(role === 'district_manager' && { district })
      });
      // Redirect is handled by App.tsx based on auth state
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register Admin Account</h2>
        
        {error && <div className="error-message">{error}</div>}
        
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
              autoComplete="new-password"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="district_manager">District Manager</option>
            </select>
          </div>
          
          {role === 'district_manager' && (
            <div className="form-group">
              <label htmlFor="district">District</label>
              <input
                type="text"
                id="district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
              />
            </div>
          )}
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Already have an account? <a href="/login">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 