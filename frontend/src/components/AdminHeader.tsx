import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdminHeader.css';

const AdminHeader: React.FC = () => {
  return (
    <div className="admin-header">
      <nav className="admin-nav">
        <ul className="admin-nav-list">
          <li className="admin-nav-item">
            <Link to="/admin/vacancies" className="admin-nav-link">Vacancies</Link>
          </li>
          <li className="admin-nav-item">
            <Link to="/admin/users" className="admin-nav-link">User Management</Link>
          </li>
          <li className="admin-nav-item">
            <Link to="/admin/employees" className="admin-nav-link">Employee Management</Link>
          </li>
          <li className="admin-nav-item">
            <Link to="/admin/application-links" className="admin-nav-link">Generate Links</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminHeader; 