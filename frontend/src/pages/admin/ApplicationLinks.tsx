import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/AuthContext';
import MainHeader from '../../components/MainHeader';
import AdminHeader from '../../components/AdminHeader';
import '../../styles/ApplicationLinks.css';

const ApplicationLinks: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [links, setLinks] = useState<{ internal: string, external: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string, type: string } | null>(null);

  // Fetch jobs when component mounts
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/admin/jobs', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setJobs(data);
        }
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
        setMessage({ text: 'Failed to load jobs. Please try again.', type: 'error' });
      }
    };
    
    fetchJobs();
  }, []);

  // Generate application links for selected job
  const generateLinks = async () => {
    if (!selectedJob) {
      setMessage({ text: 'Please select a job first', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/jobs/${selectedJob}/application-links`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLinks(data.links);
        setMessage({ text: 'Application links generated successfully', type: 'success' });
      } else {
        const error = await response.json();
        setMessage({ text: error.error || 'Failed to generate links', type: 'error' });
      }
    } catch (error) {
      console.error('Error generating links:', error);
      setMessage({ text: 'An error occurred. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Copy link to clipboard
  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link)
      .then(() => {
        setMessage({ text: 'Link copied to clipboard!', type: 'success' });
        setTimeout(() => setMessage(null), 3000);
      })
      .catch(() => {
        setMessage({ text: 'Failed to copy link', type: 'error' });
      });
  };

  return (
    <div className="dashboard-container">
      <MainHeader />
      
      <div className="application-links-page">
        <AdminHeader />

        <div className="page-content">
          <h2>Generate Application Links</h2>
          
          {message && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="generate-links-form">
            <div className="form-group">
              <label htmlFor="job-select">Select Job/Vacancy:</label>
              <select 
                id="job-select" 
                value={selectedJob} 
                onChange={(e) => setSelectedJob(e.target.value)}
              >
                <option value="">-- Select a job --</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.title} - {job.location}
                  </option>
                ))}
              </select>
            </div>

            <button 
              className="generate-btn" 
              onClick={generateLinks} 
              disabled={loading || !selectedJob}
            >
              {loading ? 'Generating...' : 'Generate Application Links'}
            </button>
          </div>

          {links && (
            <div className="links-result">
              <h3>Application Links</h3>
              
              <div className="link-box">
                <div className="link-header">
                  <h4>Internal Applicants Link</h4>
                  <button 
                    className="copy-btn" 
                    onClick={() => copyToClipboard(links.internal)}
                  >
                    Copy
                  </button>
                </div>
                <div className="link-content">
                  <p className="link-url">{links.internal}</p>
                  <p className="link-desc">Share this link with current employees who wish to apply for this position.</p>
                </div>
              </div>
              
              <div className="link-box">
                <div className="link-header">
                  <h4>External Applicants Link</h4>
                  <button 
                    className="copy-btn" 
                    onClick={() => copyToClipboard(links.external)}
                  >
                    Copy
                  </button>
                </div>
                <div className="link-content">
                  <p className="link-url">{links.external}</p>
                  <p className="link-desc">Share this link with external candidates who wish to apply for this position.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationLinks; 