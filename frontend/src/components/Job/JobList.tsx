import React from 'react';
import JobCard from './JobCard';

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
  qualifications?: string;
}

interface JobListProps {
  jobs: Job[];
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onUpdateStatus?: (id: string, status: string) => void;
  loading?: boolean;
  emptyMessage?: string;
}

const JobList: React.FC<JobListProps> = ({ 
  jobs, 
  isAdmin = false,
  onDelete,
  onUpdateStatus,
  loading = false,
  emptyMessage = "No jobs found"
}) => {
  if (loading) {
    return <div className="loading">Loading jobs...</div>;
  }

  if (jobs.length === 0) {
    return <div className="empty-state">{emptyMessage}</div>;
  }

  return (
    <div className="job-list">
      {jobs.map(job => (
        <JobCard
          key={job.id}
          id={job.id}
          title={job.title}
          description={job.description}
          department={job.department}
          location={job.location}
          jobType={job.jobType}
          salary={job.salary}
          status={job.status}
          postedDate={job.postedDate}
          deadline={job.deadline}
          qualifications={job.qualifications}
          isAdmin={isAdmin}
          onDelete={onDelete}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
    </div>
  );
};

export default JobList; 