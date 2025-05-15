import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobAPI } from '../services/api';
import JobDetailView from '../components/Job/JobDetailView';
import { useAuth } from '../services/AuthContext';

interface Job {
  id: string;
  title: string;
  description: string;
  qualifications?: string;
  department: string;
  location: string;
  jobType: string;
  salary?: string;
  status?: string;
  createdAt?: string;
  deadline?: string;
}

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await jobAPI.getById(Number(id));
        
        // Transform the data to match our Job interface
        const formattedJob = {
          id: data.id.toString(),
          title: data.title || '',
          description: data.description || '',
          qualifications: data.qualifications || '',
          department: data.department || '',
          location: data.location || '',
          jobType: data.job_type || '',
          salary: data.salary,
          status: data.status || 'open',
          createdAt: data.created_at,
          deadline: data.deadline
        };
        
        setJob(formattedJob);
      } catch (err: any) {
        console.error("Error fetching job details:", err);
        setError(err.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  const handleDeleteJob = async (jobId: string) => {
    if (!user || user.role !== 'admin') {
      return;
    }
    
    try {
      await jobAPI.delete(Number(jobId));
      navigate('/admin/jobs');
    } catch (err: any) {
      setError(err.message || 'Failed to delete job');
    }
  };

  if (loading) {
    return <div className="loading">Loading job details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!job) {
    return <div className="not-found">Job not found</div>;
  }

  return (
    <div className="page-container">
      <JobDetailView
        id={job.id}
        title={job.title}
        description={job.description}
        qualifications={job.qualifications}
        department={job.department}
        location={job.location}
        jobType={job.jobType}
        salary={job.salary}
        status={job.status}
        postedDate={job.createdAt}
        deadline={job.deadline}
        isAdmin={user?.role === 'admin'}
        onDelete={handleDeleteJob}
      />
    </div>
  );
};

export default JobDetail; 