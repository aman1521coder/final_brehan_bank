import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';

interface JobDetailProps {
  id: string;
  title: string;
  description: string;
  qualifications?: string;
  department: string;
  location: string;
  jobType: string;
  salary?: string;
  status?: string;
  postedDate?: string;
  deadline?: string;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
}

const JobDetailView: React.FC<JobDetailProps> = ({
  id,
  title,
  description,
  qualifications,
  department,
  location,
  jobType,
  salary,
  status = 'open',
  postedDate,
  deadline,
  isAdmin = false,
  onDelete
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isApplying, setIsApplying] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this job?')) {
      onDelete(id);
      navigate('/admin/jobs');
    }
  };

  const handleApply = () => {
    // For employees of the bank, direct to internal application
    if (user) {
      navigate(`/jobs/${id}/apply-internal`);
    } else {
      // For external applicants
      navigate(`/jobs/${id}/apply-external`);
    }
  };

  return (
    <div className="job-detail">
      <div className="job-detail-header">
        <h2>{title}</h2>
        <span className={`job-status job-status-${status.toLowerCase()}`}>
          {status}
        </span>
      </div>

      <div className="job-detail-meta">
        <div className="job-meta-item">
          <span className="job-meta-label">Department:</span>
          <span className="job-meta-value">{department}</span>
        </div>
        
        <div className="job-meta-item">
          <span className="job-meta-label">Location:</span>
          <span className="job-meta-value">{location}</span>
        </div>
        
        <div className="job-meta-item">
          <span className="job-meta-label">Type:</span>
          <span className="job-meta-value">{jobType}</span>
        </div>
        
        {salary && (
          <div className="job-meta-item">
            <span className="job-meta-label">Salary:</span>
            <span className="job-meta-value">{salary}</span>
          </div>
        )}
        
        {postedDate && (
          <div className="job-meta-item">
            <span className="job-meta-label">Posted On:</span>
            <span className="job-meta-value">{formatDate(postedDate)}</span>
          </div>
        )}
        
        {deadline && (
          <div className="job-meta-item">
            <span className="job-meta-label">Apply Before:</span>
            <span className="job-meta-value">{formatDate(deadline)}</span>
          </div>
        )}
      </div>

      <div className="job-detail-section">
        <h3>Job Description</h3>
        <div className="job-description">
          {description.split('\n').map((para, index) => (
            <p key={index}>{para}</p>
          ))}
        </div>
      </div>

      {qualifications && (
        <div className="job-detail-section">
          <h3>Qualifications</h3>
          <div className="job-requirements">
            {qualifications.split('\n').map((req, index) => (
              <p key={index}>{req}</p>
            ))}
          </div>
        </div>
      )}

      <div className="job-detail-actions">
        {status === 'open' && !isAdmin && (
          <button 
            className="btn btn-primary btn-lg" 
            onClick={handleApply}
            disabled={isApplying}
          >
            {isApplying ? 'Processing...' : 'Apply for this Position'}
          </button>
        )}
        
        {isAdmin && (
          <div className="admin-actions">
            <Link to={`/admin/jobs/${id}/edit`} className="btn btn-secondary">
              Edit Job
            </Link>
            <button onClick={handleDelete} className="btn btn-danger">
              Delete Job
            </button>
            <Link to={`/admin/jobs/${id}/applications`} className="btn btn-info">
              View Applications
            </Link>
          </div>
        )}
        
        <Link to={isAdmin ? "/admin/jobs" : "/jobs"} className="btn btn-link">
          Back to Job Listings
        </Link>
      </div>
    </div>
  );
};

export default JobDetailView; 