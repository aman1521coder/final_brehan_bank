import React from 'react';
import { Link } from 'react-router-dom';

interface JobProps {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  jobType: string;
  salary?: string;
  status?: string;
  postedDate?: string;
  deadline?: string;
  qualifications?: string;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onUpdateStatus?: (id: string, status: string) => void;
}

const JobCard: React.FC<JobProps> = ({
  id,
  title,
  description,
  department,
  location,
  jobType,
  salary,
  status = 'open',
  postedDate,
  deadline,
  qualifications,
  isAdmin = false,
  onDelete,
  onUpdateStatus
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this job?')) {
      onDelete(id);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onUpdateStatus) {
      onUpdateStatus(id, e.target.value);
    }
  };

  return (
    <div className="job-card">
      <div className="job-card-header">
        <h3>{title}</h3>
        {isAdmin && onUpdateStatus ? (
          <select 
            className={`job-status-select job-status-${status.toLowerCase()}`}
            value={status}
            onChange={handleStatusChange}
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="filled">Filled</option>
          </select>
        ) : (
          <span className={`job-status job-status-${status.toLowerCase()}`}>
            {status}
          </span>
        )}
      </div>
      
      <div className="job-card-info">
        <div className="job-info-item">
          <span className="job-info-label">Department:</span>
          <span className="job-info-value">{department}</span>
        </div>
        
        <div className="job-info-item">
          <span className="job-info-label">Location:</span>
          <span className="job-info-value">{location}</span>
        </div>
        
        <div className="job-info-item">
          <span className="job-info-label">Type:</span>
          <span className="job-info-value">{jobType}</span>
        </div>
        
        {salary && (
          <div className="job-info-item">
            <span className="job-info-label">Salary:</span>
            <span className="job-info-value">{salary}</span>
          </div>
        )}
        
        {postedDate && (
          <div className="job-info-item">
            <span className="job-info-label">Posted:</span>
            <span className="job-info-value">{formatDate(postedDate)}</span>
          </div>
        )}
        
        {deadline && (
          <div className="job-info-item">
            <span className="job-info-label">Deadline:</span>
            <span className="job-info-value">{formatDate(deadline)}</span>
          </div>
        )}
      </div>
      
      <div className="job-card-description">
        <p>{description.length > 150 ? `${description.substring(0, 150)}...` : description}</p>
      </div>
      
      {qualifications && (
        <div className="job-card-qualifications">
          <h4>Qualifications:</h4>
          <p>{qualifications.length > 150 ? `${qualifications.substring(0, 150)}...` : qualifications}</p>
        </div>
      )}
      
      <div className="job-card-actions">
        <Link to={`/jobs/${id}`} className="btn btn-primary">
          View Details
        </Link>
        
        {isAdmin && (
          <>
            <Link to={`/admin/jobs/${id}/edit`} className="btn btn-secondary">
              Edit
            </Link>
            <button onClick={handleDelete} className="btn btn-danger">
              Delete
            </button>
            <Link to={`/admin/jobs/${id}/applications`} className="btn btn-info">
              View Applications
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default JobCard; 