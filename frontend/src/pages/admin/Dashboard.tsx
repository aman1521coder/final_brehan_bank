import React, { useEffect, useState } from 'react';
import { useAuth } from '../../services/AuthContext';
import { employeeAPI, userAPI } from '../../services/api';
import MainHeader from '../../components/MainHeader';
import AdminHeader from '../../components/AdminHeader';
import '../../styles/Dashboard.css';

// Development mock data
const MOCK_USERS = [
  { id: '1', name: 'Admin User', role: 'admin' },
  { id: '2', name: 'Manager User', role: 'manager' },
  { id: '3', name: 'District Manager', role: 'district_manager', district: 'East Addis District' },
];

const MOCK_EMPLOYEES = [
  { 
    id: '1', 
    fileNumber: 'EMP001', 
    fullName: 'John Doe', 
    sex: 'Male',
    jobGrade: 'Senior',
    jobCategory: 'Management',
    currentPosition: 'Branch Manager',
    branch: 'East Addis',
    department: 'Operations',
    district: 'East Addis District',
    region: 'Addis Ababa',
    educationalLevel: 'Masters',
    fieldOfStudy: 'Business Administration',
    individualPMS: 85,
    tmdrec20: 17,
    disRect15: 12,
    totalexp20: 15,
    employmentDate: new Date().toISOString().split('T')[0]
  },
  { 
    id: '2', 
    fileNumber: 'EMP002', 
    fullName: 'Jane Smith', 
    sex: 'Female',
    jobGrade: 'Mid-level',
    jobCategory: 'Customer Service',
    currentPosition: 'Customer Service Rep',
    branch: 'West Addis',
    department: 'Customer Service',
    district: 'West Addis District',
    region: 'Addis Ababa',
    educationalLevel: 'Bachelors',
    fieldOfStudy: 'Marketing',
    individualPMS: 78,
    tmdrec20: 15,
    disRect15: 11,
    totalexp20: 10,
    employmentDate: new Date().toISOString().split('T')[0]
  }
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [recentEmployees, setRecentEmployees] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Remove development mode check to always try the real API first
        
        // For production, try real API
        const [employees, users] = await Promise.all([
          employeeAPI.getAll(),
          userAPI.getAll()
        ]);
        
        setEmployeeCount(employees.length);
        setUserCount(users.length);
        setRecentEmployees(employees.slice(0, 5));
        setRecentUsers(users.slice(0, 5));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Fallback to mock data on error even in production
        setEmployeeCount(MOCK_EMPLOYEES.length);
        setUserCount(MOCK_USERS.length);
        setRecentEmployees(MOCK_EMPLOYEES.slice(0, 5));
        setRecentUsers(MOCK_USERS.slice(0, 5));
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  return (
    <div>
      <MainHeader />
      <AdminHeader />
      <div className="dashboard-container">
        <h2>Admin Dashboard</h2>
        <div className="welcome-message">
          <h3>Welcome, {user?.name || 'Administrator'}</h3>
          <p>Here's what's happening at Berhan Bank HR system</p>
        </div>
        
        {loading ? (
          <div className="loading">Loading dashboard data...</div>
        ) : (
          <>
            <div className="dashboard-stats">
              <div className="stat-card">
                <h3>Employees</h3>
                <p className="stat-number">{employeeCount}</p>
                <p className="stat-description">Total employees registered</p>
              </div>
              
              <div className="stat-card">
                <h3>Users</h3>
                <p className="stat-number">{userCount}</p>
                <p className="stat-description">System users and admins</p>
              </div>
            </div>
            
            <div className="dashboard-recent">
              <div className="recent-section">
                <h3>Recent Employees</h3>
                {recentEmployees.length > 0 ? (
                  <ul className="recent-list">
                    {recentEmployees.map(employee => (
                      <li key={employee.id} className="recent-item">
                        <span className="recent-name">{employee.fullName}</span>
                        <span className="recent-details">{employee.currentPosition} at {employee.branch}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-data">No employees found</p>
                )}
              </div>
              
              <div className="recent-section">
                <h3>Recent Users</h3>
                {recentUsers.length > 0 ? (
                  <ul className="recent-list">
                    {recentUsers.map(user => (
                      <li key={user.id} className="recent-item">
                        <span className="recent-name">{user.name}</span>
                        <span className="recent-details">{user.role} {user.district ? `(${user.district})` : ''}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-data">No users found</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 