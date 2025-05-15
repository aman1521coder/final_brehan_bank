import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };
  
  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <h1>Bank HR System</h1>
        </div>
        
        {isAuthenticated ? (
          <>
            <nav className="navigation">
              <ul>
                <li><Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link></li>
                
                {/* Employee links visible to all authenticated users */}
                <li><Link to="/employees" className={isActive('/employees')}>Employees</Link></li>
                <li><Link to="/jobs" className={isActive('/jobs')}>Jobs</Link></li>
                
                {/* Manager-specific links */}
                {user?.role === 'manager' && (
                  <li><Link to="/manager" className={isActive('/manager')}>Manager Portal</Link></li>
                )}
                
                {/* District manager-specific links */}
                {user?.role === 'district_manager' && (
                  <li><Link to="/district" className={isActive('/district')}>District Portal</Link></li>
                )}
                
                {/* Admin-specific links */}
                {user?.role === 'admin' && (
                  <li><Link to="/admin" className={isActive('/admin')}>Admin Portal</Link></li>
                )}
              </ul>
            </nav>
            
            <div className="user-profile">
              <button className="profile-button">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">({user?.role.replace('_', ' ')})</span>
                <span className="avatar">👤</span>
              </button>
              <div className="dropdown-menu">
                <button onClick={logout} className="logout-btn">Logout</button>
              </div>
            </div>
          </>
        ) : (
          <nav className="navigation">
            <ul>
              <li><Link to="/login" className={isActive('/login')}>Login</Link></li>
              <li><Link to="/register" className={isActive('/register')}>Register</Link></li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header; 