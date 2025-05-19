import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdminHeader.css';

const DistrictManagerHeader: React.FC = () => {
  return (
    <div className="admin-header">
      <nav className="admin-nav">
        <ul className="admin-nav-list">
          <li className="admin-nav-item">
            <Link to="/district/dashboard" className="admin-nav-link">Dashboard</Link>
          </li>
          <li className="admin-nav-item">
            <Link to="/district/employees" className="admin-nav-link">District Employees</Link>
          </li>
          <li className="admin-nav-item">
            <Link to="/district/recommendations" className="admin-nav-link">Recommendations</Link>
          </li>
          <li className="admin-nav-item">
            <Link to="/district/vacancies" className="admin-nav-link">View Vacancies</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default DistrictManagerHeader; 