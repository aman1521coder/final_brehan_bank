import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Welcome to the Bank HR System</h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
        <div className="user-portal">
          <h3>Employee Portals</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/manager-dashboard" className="btn btn-primary">Manager Dashboard (25% Evaluation)</Link>
            <Link to="/district-manager" className="btn btn-success">District Manager Dashboard (15% Evaluation)</Link>
            <Link to="/hr-dashboard" className="btn btn-info">HR Dashboard</Link>
          </div>
        </div>
        
        <div className="applicant-portal">
          <h3>Applicant Portals</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/internal-application" className="btn btn-warning">Internal Employee Application</Link>
            <Link to="/external-application" className="btn btn-danger">External Applicant</Link>
          </div>
        </div>
      </div>
      
      <p style={{ marginTop: '30px' }}>Please <Link to="/login">login</Link> to access restricted features.</p>
    </div>
  );
};

export default Home; 