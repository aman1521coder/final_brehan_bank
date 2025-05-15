import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Bank HR System</h3>
            <p>Employee management made easy</p>
          </div>
          <div className="footer-section">
            <h3>Links</h3>
            <ul>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/contact">Contact HR</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Resources</h3>
            <ul>
              <li><a href="#" target="_blank" rel="noopener noreferrer">HR Guidelines</a></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer">Employee Handbook</a></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer">PMS Documentation</a></li>
            </ul>
          </div>
        </div>
        <div className="copyright">
          <p>&copy; {new Date().getFullYear()} Bank HR System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 