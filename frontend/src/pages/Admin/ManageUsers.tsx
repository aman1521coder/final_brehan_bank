import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';

interface User {
  id: string;
  name: string;
  role: string;
  district?: string;
  lastLogin?: string;
}

// Mock data until we have a proper API endpoint
const mockUsers: User[] = [
  { id: '1', name: 'testadmin', role: 'admin', lastLogin: '2025-05-12 10:30:00' },
  { id: '2', name: 'manager1', role: 'manager', lastLogin: '2025-05-10 14:15:00' },
  { id: '3', name: 'districtmgr1', role: 'district_manager', district: 'North', lastLogin: '2025-05-11 09:45:00' },
  { id: '4', name: 'manager2', role: 'manager', lastLogin: '2025-05-09 11:20:00' },
  { id: '5', name: 'districtmgr2', role: 'district_manager', district: 'South', lastLogin: '2025-05-08 16:30:00' },
];

const ManageUsers: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Only admin can access user management
  if (user?.role !== 'admin') {
    return (
      <div className="error-message">
        You don't have permission to access this page.
      </div>
    );
  }

  useEffect(() => {
    // This would be an API call in production
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Simulate API call
        setTimeout(() => {
          setUsers(mockUsers);
          setLoading(false);
        }, 500);
      } catch (err: any) {
        setError('Failed to load users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleResetPassword = (userId: string) => {
    // In a real app, this would call an API endpoint
    alert(`Password reset for user ${userId} would be triggered here`);
  };

  const filteredUsers = searchTerm 
    ? users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.district && u.district.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : users;

  const formatRole = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'manager':
        return 'Manager';
      case 'district_manager':
        return 'District Manager';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  return (
    <div className="admin-container">
      <div className="page-header">
        <h2>User Account Management</h2>
        <div className="header-actions">
          <Link to="/admin/create-user" className="btn btn-primary">
            Create New User
          </Link>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="search-bar">
        <input 
          type="text" 
          placeholder="Search users..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="user-list">
          <div className="user-list-header">
            <div className="user-name">Username</div>
            <div className="user-role">Role</div>
            <div className="user-district">District</div>
            <div className="user-last-login">Last Login</div>
            <div className="user-actions">Actions</div>
          </div>
          
          {filteredUsers.length > 0 ? (
            filteredUsers.map(u => (
              <div key={u.id} className="user-list-item">
                <div className="user-name">{u.name}</div>
                <div className="user-role">{formatRole(u.role)}</div>
                <div className="user-district">{u.district || '-'}</div>
                <div className="user-last-login">{u.lastLogin || 'Never'}</div>
                <div className="user-actions">
                  <button 
                    className="btn btn-small" 
                    onClick={() => handleResetPassword(u.id)}
                  >
                    Reset Password
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">
              {searchTerm ? 'No users match your search.' : 'No users found.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageUsers; 