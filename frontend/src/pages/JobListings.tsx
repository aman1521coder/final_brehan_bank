import React, { useState, useEffect } from 'react';
import { publicAPI } from '../services/api';
import JobList from '../components/Job/JobList';

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

const JobListings: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const data = await publicAPI.getJobs();
        
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

  const filteredJobs = jobs.filter(job => {
    // Filter by job status
    if (filter !== 'all' && job.jobType !== filter) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !(
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
    )) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Career Opportunities</h1>
        <p>Find your perfect role at the bank</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-container">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search jobs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-options">
          <label>Filter by type:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Jobs</option>
            <option value="internal">Internal Only</option>
            <option value="external">External Only</option>
            <option value="both">Both Internal & External</option>
          </select>
        </div>
      </div>

      <JobList 
        jobs={filteredJobs}
        loading={loading}
        emptyMessage={
          searchTerm || filter !== 'all' 
            ? "No jobs match your search criteria." 
            : "No job openings available at this time."
        }
      />
    </div>
  );
};

export default JobListings; 