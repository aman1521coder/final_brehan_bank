import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/AuthContext';
import MainHeader from '../../components/MainHeader';
import AdminHeader from '../../components/AdminHeader';
import '../../styles/Vacancies.css';

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  department: string;
  salary_range: string;
  salary: number;
  job_type: string;
  application_deadline: string;
  status: string;
}

const Vacancies: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{ text: string, type: string } | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [newCreatedJobId, setNewCreatedJobId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Job>>({
    title: '',
    description: '',
    requirements: '',
    location: '',
    department: '',
    salary_range: '',
    salary: 0,
    job_type: 'internal',
    application_deadline: '',
    status: 'open',
  });

  // Fetch jobs when component mounts
  useEffect(() => {
    fetchJobs();
  }, []);

  // Fetch all jobs
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/jobs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      } else {
        const error = await response.json();
        setMessage({ text: error.error || 'Failed to load jobs', type: 'error' });
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setMessage({ text: 'An error occurred. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      requirements: '',
      location: '',
      department: '',
      salary_range: '',
      salary: 0,
      job_type: 'internal',
      application_deadline: '',
      status: 'open',
    });
    setEditingJob(null);
  };

  // Show form for creating a new job
  const handleCreateNew = () => {
    resetForm();
    setShowForm(true);
  };

  // Show form for editing an existing job
  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      location: job.location,
      department: job.department,
      salary_range: job.salary_range,
      salary: job.salary || 0,
      job_type: job.job_type,
      application_deadline: job.application_deadline,
      status: job.status,
    });
    setShowForm(true);
  };

  // Submit form to create or update a job
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let response;
      if (editingJob) {
        // Update existing job
        response = await fetch(`/api/admin/jobs/${editingJob.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
      } else {
        // Create new job
        response = await fetch('/api/admin/jobs', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
      }

      if (response.ok) {
        const data = await response.json();
        const successMessage = editingJob ? 'Job updated successfully' : 'New job created successfully';
        setMessage({ text: successMessage, type: 'success' });
        
        // If creating a new job, store the job ID for link generation
        if (!editingJob && data.id) {
          setNewCreatedJobId(data.id);
        } else {
          setShowForm(false);
        }
        
        resetForm();
        fetchJobs(); // Refresh jobs list
      } else {
        const error = await response.json();
        setMessage({ text: error.error || 'Operation failed', type: 'error' });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage({ text: 'An error occurred. Please try again.', type: 'error' });
    }
  };

  // Delete a job
  const handleDelete = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setMessage({ text: 'Job deleted successfully', type: 'success' });
        fetchJobs(); // Refresh jobs list
      } else {
        const error = await response.json();
        setMessage({ text: error.error || 'Failed to delete job', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      setMessage({ text: 'An error occurred. Please try again.', type: 'error' });
    }
  };

  // View applications for a job
  const viewApplications = (jobId: string) => {
    window.location.href = `/admin/jobs/${jobId}/applications`;
  };

  // Generate application links for a job
  const generateLinks = (jobId: string) => {
    window.location.href = `/admin/application-links?job=${jobId}`;
  };

  // Go directly to application links page after creating a job
  const goToApplicationLinks = () => {
    if (newCreatedJobId) {
      window.location.href = `/admin/application-links?job=${newCreatedJobId}`;
    }
    setNewCreatedJobId(null);
  };

  return (
    <div className="dashboard-container">
      <MainHeader />
      
      <div className="vacancies-page">
        <AdminHeader />

        <div className="page-content">
          <div className="page-header">
            <h2>Manage Vacancies</h2>
            <button className="create-btn" onClick={handleCreateNew}>
              Create New Vacancy
            </button>
          </div>
          
          {message && (
            <div className={`message ${message.type}`}>
              {message.text}
              {newCreatedJobId && (
                <div className="post-create-actions">
                  <p>What would you like to do next?</p>
                  <button 
                    onClick={goToApplicationLinks} 
                    className="action-btn generate-link-btn"
                  >
                    Generate Application Links
                  </button>
                  <button 
                    onClick={() => setNewCreatedJobId(null)} 
                    className="action-btn continue-btn"
                  >
                    Continue Managing Vacancies
                  </button>
                </div>
              )}
            </div>
          )}

          {showForm && (
            <div className="job-form-container">
              <h3>{editingJob ? 'Edit Vacancy' : 'Create New Vacancy'}</h3>
              <form onSubmit={handleSubmit} className="job-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="title">Job Title</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="department">Department</label>
                    <input
                      type="text"
                      id="department"
                      name="department"
                      value={formData.department || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="salary_range">Salary Range</label>
                    <input
                      type="text"
                      id="salary_range"
                      name="salary_range"
                      value={formData.salary_range || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="salary">Salary (Exact Amount)</label>
                    <input
                      type="number"
                      id="salary"
                      name="salary"
                      value={formData.salary || 0}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="job_type">Job Type</label>
                    <select
                      id="job_type"
                      name="job_type"
                      value={formData.job_type || 'internal'}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="internal">Internal</option>
                      <option value="external">External</option>
                      <option value="both">Both Internal and External</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="application_deadline">Application Deadline</label>
                    <input
                      type="date"
                      id="application_deadline"
                      name="application_deadline"
                      value={formData.application_deadline || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status || 'open'}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description">Job Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    rows={5}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="requirements">Requirements</label>
                  <textarea
                    id="requirements"
                    name="requirements"
                    value={formData.requirements || ''}
                    onChange={handleInputChange}
                    rows={5}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    {editingJob ? 'Update Vacancy' : 'Create Vacancy'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="loading">Loading vacancies...</div>
          ) : jobs.length === 0 ? (
            <div className="no-jobs">
              <p>No vacancies found. Create a new vacancy to get started.</p>
            </div>
          ) : (
            <div className="jobs-list">
              <table className="jobs-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Department</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job.id} className={`job-row ${job.status === 'closed' ? 'closed-job' : ''}`}>
                      <td>{job.title}</td>
                      <td>{job.department}</td>
                      <td>{job.location}</td>
                      <td>{job.job_type}</td>
                      <td>{new Date(job.application_deadline).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge status-${job.status}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button onClick={() => handleEdit(job)} className="action-btn edit-btn">
                          Edit
                        </button>
                        <button onClick={() => viewApplications(job.id)} className="action-btn view-btn">
                          Applications
                        </button>
                        <button onClick={() => generateLinks(job.id)} className="action-btn link-btn">
                          Links
                        </button>
                        <button onClick={() => handleDelete(job.id)} className="action-btn delete-btn">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Vacancies; 