import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import MainHeader from '../components/MainHeader';
import AdminHeader from '../components/AdminHeader';
import ManagerHeader from '../components/ManagerHeader';
import DistrictManagerHeader from '../components/DistrictManagerHeader';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Debug console logs
  console.log('Dashboard component rendering');
  console.log('User:', user);
  console.log('Loading:', loading);

  // Redirect to login if not authenticated
  useEffect(() => {
    console.log('Dashboard useEffect running, user:', user, 'loading:', loading);
    if (!loading && !user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    console.log('Dashboard is in loading state');
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!user) {
    console.log('Dashboard has no user, returning null');
    return null; // Will redirect to login
  }

  // Render header based on user role
  const renderRoleHeader = () => {
    console.log('Rendering role header for role:', user.role);
    switch (user.role) {
      case 'admin':
        return <AdminHeader />;
      case 'manager':
        return <ManagerHeader />;
      case 'district_manager':
        return <DistrictManagerHeader />;
      default:
        console.log('Unknown role:', user.role);
        return null;
    }
  };

  console.log('Dashboard rendering main content for role:', user.role);
  return (
    <div className="dashboard-container">
      <MainHeader />
      
      <div className="dashboard">
        {renderRoleHeader()}
        
        <div className="dashboard-content">
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Dashboard</h3>
            </div>
            <div className="card-content">
              {user.role === 'admin' && (
                <div>
                  <p>Administration Dashboard</p>
                  <p>Use the navigation above to manage vacancies, users, employees, and application links.</p>
                </div>
              )}
              
              {user.role === 'manager' && (
                <div>
                  <p>Manager Dashboard</p>
                  <p>Use the navigation above to manage your team and evaluate employee performance.</p>
                </div>
              )}
              
              {user.role === 'district_manager' && (
                <div>
                  <p>District Manager Dashboard</p>
                  <p>Use the navigation above to oversee your district operations and provide recommendations.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 