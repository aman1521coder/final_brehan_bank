import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';
import { jobAPI } from '../../services/api';
import JobList from '../../components/Job/JobList';

interface Job {
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
}

const ManageJobs: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Only admin can access job management
  if (user?.role !== 'admin') {
    return (
      <div className="error-message">
        You don't have permission to access this page.
      </div>
    );
  }

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const data = await jobAPI.getAll();
        
        // Transform the data to match our Job interface
        const formattedJobs = data.map((job: any) => ({
          id: job.id.toString(),
          title: job.title || '',
          description: job.description || '',
          department: job.department || '',
          location: job.location || '',
          jobType: job.job_type || '',
          salary: job.salary,
          status: job.status || 'open',
          postedDate: job.posted_date,
          deadline: job.deadline
        }));
        
        setJobs(formattedJobs);
      } catch (err: any) {
        console.error("Error fetching jobs:", err);
        setError(err.message || 'Failed to load job listings');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleDeleteJob = async (jobId: string) => {
    try {
      await jobAPI.delete(Number(jobId));
      // Filter out the deleted job
      setJobs(jobs.filter(job => job.id !== jobId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete job');
    }
  };

  const filteredJobs = searchTerm 
    ? jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : jobs;

  return (
    <div className="admin-container">
      <div className="page-header">
        <h2>Job Listings Management</h2>
        <div className="header-actions">
          <Link to="/admin/create-job" className="btn btn-primary">
            Create New Job
          </Link>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="search-bar">
        <input 
          type="text" 
          placeholder="Search jobs..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <JobList 
        jobs={filteredJobs}
        isAdmin={true}
        onDelete={handleDeleteJob}
        loading={loading}
        emptyMessage={searchTerm ? "No jobs match your search." : "No job listings found."}
      />
    </div>
  );
};

export default ManageJobs; 