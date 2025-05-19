import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import '../styles/MainHeader.css';

const MainHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="main-header">
      <div className="logo-container">
        <div className="logo"></div>
        <span className="app-name">Berhan Bank HR System</span>
      </div>
      
      {user && (
        <div className="user-menu">
          <div className="user-info">
            <span>{user.name}</span>
            {user.role && <span> | {user.role.replace('_', ' ')}</span>}
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default MainHeader; 