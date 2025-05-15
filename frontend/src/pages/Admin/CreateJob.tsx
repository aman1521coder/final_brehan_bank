import React, { useState } from 'react';
import { useAuth } from '../../services/AuthContext';
import { jobAPI } from '../../services/api';

const CreateJob: React.FC = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [jobType, setJobType] = useState('full-time');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Only admin can create job postings
  if (user?.role !== 'admin') {
    return (
      <div className="error-message">
        You don't have permission to access this page.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await jobAPI.create({
        title,
        department,
        description,
        qualifications,
        jobType,
        location,
        salary: salary ? parseFloat(salary) : null,
      });

      // Clear form and show success message
      setTitle('');
      setDepartment('');
      setDescription('');
      setQualifications('');
      setJobType('full-time');
      setLocation('');
      setSalary('');
      setSuccess('Job posting created successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to create job posting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="page-header">
        <h2>Create Job Posting</h2>
      </div>

      <div className="admin-card">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Job Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input
              type="text"
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Job Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="qualifications">Qualifications</label>
            <textarea
              id="qualifications"
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="jobType">Job Type</label>
            <select
              id="jobType"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              required
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="temporary">Temporary</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="salary">Salary Range</label>
            <input
              type="text"
              id="salary"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="e.g., 50,000-70,000"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Job...' : 'Create Job Posting'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateJob; 