import React from 'react';
import { Link } from 'react-router-dom';

interface EmployeeCardProps {
  id: string;
  fullName: string;
  position: string;
  fileNumber?: string;
  branch?: string;
  department?: string;
  district?: string;
  individualPMS?: number;
  tmdrec20?: number;  // Manager recommendation (20%)
  disRect15?: number; // District recommendation (15%)
  totalexp20?: number; // Total experience (20%)
  role?: string; // current user role
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  id,
  fullName,
  position,
  fileNumber,
  branch,
  department,
  district,
  individualPMS,
  tmdrec20,
  disRect15,
  totalexp20,
  role,
}) => {
  // Calculate total score if all components exist
  const hasAllScores = individualPMS !== undefined && 
                       tmdrec20 !== undefined && 
                       disRect15 !== undefined && 
                       totalexp20 !== undefined;
  
  const totalScore = hasAllScores 
    ? (individualPMS || 0) + (tmdrec20 || 0) + (disRect15 || 0) + (totalexp20 || 0)
    : undefined;

  // Different view based on user role
  if (role === 'district_manager') {
    // District managers see limited information
    return (
      <div className="employee-card">
        <div className="employee-header">
          <h3>{fullName}</h3>
          <div className="employee-id-container">
            <span className="employee-id">ID: {id}</span>
            {fileNumber && <span className="employee-file-number">File #: {fileNumber}</span>}
          </div>
        </div>
        
        <div className="employee-details">
          {tmdrec20 !== undefined && (
            <div className="employee-detail">
              <span className="detail-label">Manager Recommendation (20%):</span>
              <span className="detail-value">{tmdrec20}</span>
            </div>
          )}
        </div>
        
        <div className="employee-actions">
          <Link to={`/district/employees/${id}/evaluation`} className="btn btn-sm">View Evaluation</Link>
          <Link to={`/district/employees/${id}/recommendation`} className="btn btn-primary btn-sm">
            Update District Recommendation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-card">
      <div className="employee-header">
        <h3>{fullName}</h3>
        <div className="employee-subheader">
          <span className="employee-position">{position}</span>
          {fileNumber && <span className="employee-file-number">File #: {fileNumber}</span>}
        </div>
      </div>
      
      <div className="employee-details">
        {branch && (
          <div className="employee-detail">
            <span className="detail-label">Branch:</span>
            <span className="detail-value">{branch}</span>
          </div>
        )}
        
        {department && (
          <div className="employee-detail">
            <span className="detail-label">Department:</span>
            <span className="detail-value">{department}</span>
          </div>
        )}
        
        {district && (
          <div className="employee-detail">
            <span className="detail-label">District:</span>
            <span className="detail-value">{district}</span>
          </div>
        )}
        
        {role === 'admin' || role === 'manager' ? (
          <>
            {individualPMS !== undefined && (
              <div className="employee-detail">
                <span className="detail-label">Individual PMS (25%):</span>
                <span className="detail-value">{individualPMS}</span>
              </div>
            )}
            
            {tmdrec20 !== undefined && (
              <div className="employee-detail">
                <span className="detail-label">Manager Recommendation (20%):</span>
                <span className="detail-value">{tmdrec20}</span>
              </div>
            )}
            
            {disRect15 !== undefined && (
              <div className="employee-detail">
                <span className="detail-label">District Recommendation (15%):</span>
                <span className="detail-value">{disRect15}</span>
              </div>
            )}
            
            {totalexp20 !== undefined && (
              <div className="employee-detail">
                <span className="detail-label">Total Experience (20%):</span>
                <span className="detail-value">{totalexp20}</span>
              </div>
            )}
            
            {totalScore !== undefined && (
              <div className="employee-detail total-score">
                <span className="detail-label">Total Score:</span>
                <span className="detail-value">{totalScore}</span>
              </div>
            )}
          </>
        ) : null}
      </div>
      
      <div className="employee-actions">
        <Link to={`/employees/${id}`} className="btn btn-sm">View Details</Link>
        
        {role === 'manager' && (
          <>
            <Link to={`/manager/employees/${id}/pms`} className="btn btn-primary btn-sm">
              Update PMS
            </Link>
            <Link to={`/manager/employees/${id}/recommendation`} className="btn btn-primary btn-sm">
              Update Recommendation
            </Link>
            <Link to={`/manager/employees/${id}/evaluation`} className="btn btn-info btn-sm">
              View Evaluation
            </Link>
          </>
        )}
        
        {role === 'admin' && (
          <Link to={`/admin/employees/${id}/edit`} className="btn btn-primary btn-sm">
            Edit Employee
          </Link>
        )}
      </div>
    </div>
  );
};

export default EmployeeCard; 