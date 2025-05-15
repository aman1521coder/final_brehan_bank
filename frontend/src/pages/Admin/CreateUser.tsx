import React, { useState } from 'react';
import { useAuth } from '../../services/AuthContext';
import { authAPI } from '../../services/api';

const CreateUser: React.FC = () => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('manager');
  const [district, setDistrict] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Only admin can create users
  if (user?.role !== 'admin') {
    return (
      <div className="error-message">
        You don't have permission to access this page.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate district if role is district_manager
    if (role === 'district_manager' && !district) {
      setError('District is required for district managers');
      setLoading(false);
      return;
    }

    try {
      await authAPI.register({ 
        name, 
        password, 
        role,
        ...(role === 'district_manager' && { district })
      });
      
      // Clear form and show success message
      setName('');
      setPassword('');
      setRole('manager');
      setDistrict('');
      setSuccess(`${role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')} account created successfully`);
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="page-header">
        <h2>Create User Account</h2>
      </div>
      
      <div className="admin-card">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Username</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            {loading ? 'Creating User...' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateUser; 