import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/AuthContext';
import MainHeader from '../../components/MainHeader';
import AdminHeader from '../../components/AdminHeader';
import { userAPI } from '../../services/api';
import '../../styles/AdminPages.css';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  role: string;
  district?: string;
  password?: string;
}

const UserManagement: React.FC = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState<{ text: string, type: string } | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    role: 'manager',
    district: '',
    password: ''
  });
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await userAPI.getAll();
        console.log('User data loaded:', data);
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (error) {
        console.error('Error loading users:', error);
        setMessage({ 
          text: error instanceof Error ? error.message : 'Failed to load users', 
          type: 'error' 
        });
        setUsers([]);
        setLoading(false);
      }
    };
    
    loadUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      role: 'manager',
      district: '',
      password: ''
    });
    setShowForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      role: user.role,
      district: user.district || '',
      password: '' // Don't populate password for security
    });
    setShowForm(true);
  };

  const closeModal = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      setLoading(true);
      await userAPI.delete(id);
      setUsers(users.filter(u => u.id !== id));
      setMessage({ text: 'User deleted successfully', type: 'success' });
      setLoading(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage({ 
        text: error instanceof Error ? error.message : 'Failed to delete user', 
        type: 'error' 
      });
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.role) {
      setMessage({ text: 'Please fill all required fields', type: 'error' });
      return;
    }
    
    if (formData.role === 'district_manager' && !formData.district) {
      setMessage({ text: 'District is required for District Manager role', type: 'error' });
      return;
    }
    
    if (!editingUser && !formData.password) {
      setMessage({ text: 'Password is required for new users', type: 'error' });
      return;
    }
    
    try {
      setFormLoading(true);
      if (editingUser) {
        // Update existing user
        const updatedUser = await userAPI.update(editingUser.id, formData);
        setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
        setMessage({ text: 'User updated successfully', type: 'success' });
      } else {
        // Create new user
        const response = await userAPI.create({
          name: formData.name!,
          password: formData.password!,
          role: formData.role!,
          district: formData.district || ''
        });
        
        setUsers([...users, { 
          id: response.user?.id || Math.random().toString(36).substring(7), 
          name: formData.name!,
          role: formData.role!,
          district: formData.district
        }]);
        
        setMessage({ text: 'User created successfully', type: 'success' });
      }
      
      setShowForm(false);
      setFormLoading(false);
    } catch (error) {
      console.error('Error saving user:', error);
      setMessage({ 
        text: error instanceof Error ? error.message : 'Failed to save user', 
        type: 'error' 
      });
      setFormLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.district || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <MainHeader />
      
      <div className="admin-page">
        <AdminHeader />

        <div className="page-content">
          <div className="page-header">
            <h2>User Management</h2>
            <button className="create-btn" onClick={handleCreateUser}>
              Add New User
            </button>
          </div>
          
          {message && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by name, role, or district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="loading">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="no-data">
              {searchTerm ? 'No users match your search criteria' : 'No users found. Add new users to get started.'}
            </div>
          ) : (
            <div className="data-list">
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Role</th>
                      <th>District</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="data-row">
                        <td>{user.id.length > 8 ? `${user.id.substring(0, 8)}...` : user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.role.replace('_', ' ')}</td>
                        <td>{user.district || '-'}</td>
                        <td className="actions-cell">
                          <div className="action-buttons">
                            <button className="action-btn edit-btn" onClick={() => handleEditUser(user)}>
                              Edit
                            </button>
                            <button className="action-btn delete-btn" onClick={() => handleDeleteUser(user.id)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {showForm && (
            <div className="modal">
              <div className="modal-content">
                <h3>{editingUser ? 'Edit User' : 'Create New User'}</h3>
                <form onSubmit={handleSubmit} className="data-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Username<span className="required">*</span></label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="role">Role<span className="required">*</span></label>
                      <select
                        id="role"
                        name="role"
                        value={formData.role || 'manager'}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="district_manager">District Manager</option>
                      </select>
                    </div>
                    
                    {formData.role === 'district_manager' && (
                      <div className="form-group">
                        <label htmlFor="district">District<span className="required">*</span></label>
                        <input
                          type="text"
                          id="district"
                          name="district"
                          value={formData.district || ''}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="password">
                        {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}<span className={editingUser ? '' : 'required'}>*</span>
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password || ''}
                        onChange={handleInputChange}
                        required={!editingUser}
                        minLength={6}
                      />
                      <p className="field-hint">Password must be at least 6 characters</p>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={closeModal}>
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn" disabled={formLoading}>
                      {formLoading ? (editingUser ? 'Saving...' : 'Creating...') : (editingUser ? 'Save Changes' : 'Create User')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement; 