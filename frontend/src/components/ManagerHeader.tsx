import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdminHeader.css';

const ManagerHeader: React.FC = () => {
  return (
    <div className="admin-header">
      <nav className="admin-nav">
        <ul className="admin-nav-list">
          <li className="admin-nav-item">
            <Link to="/manager/dashboard" className="admin-nav-link">Dashboard</Link>
          </li>
          <li className="admin-nav-item">
            <Link to="/manager/employees" className="admin-nav-link">My Employees</Link>
          </li>
          <li className="admin-nav-item">
            <Link to="/manager/evaluations" className="admin-nav-link">Performance Evaluations</Link>
          </li>
          <li className="admin-nav-item">
            <Link to="/manager/vacancies" className="admin-nav-link">View Vacancies</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default ManagerHeader; 