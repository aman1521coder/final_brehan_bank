import React, { useState } from 'react';
import axios from 'axios';

interface InternalApplicationForm {
  firstName: string;
  lastName: string;
  jobId: string;
  currentBranch: string;
  currentPosition: string;
  desiredPosition: string;
  reason: string;
}

const InternalApplication: React.FC = () => {
  const [formData, setFormData] = useState<InternalApplicationForm>({
    firstName: '',
    lastName: '',
    jobId: '',
    currentBranch: '',
    currentPosition: '',
    desiredPosition: '',
    reason: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/internal-applications', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        jobid: formData.jobId,
        current_branch: formData.currentBranch,
        current_position: formData.currentPosition,
        desired_position: formData.desiredPosition,
        reason: formData.reason
      });
      
      setSuccessMessage('Your application has been submitted successfully! Our HR team will automatically match your application with your employee record.');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        jobId: '',
        currentBranch: '',
        currentPosition: '',
        desiredPosition: '',
        reason: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit application. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mt-4">
      <h2>Internal Employee Job Application</h2>
      <p className="text-muted">Apply for internal positions with your existing employee information.</p>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="firstName" className="form-label">First Name</label>
            <input
              type="text"
              className="form-control"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="lastName" className="form-label">Last Name</label>
            <input
              type="text"
              className="form-control"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="jobId" className="form-label">Job ID / Reference Number</label>
            <input
              type="text"
              className="form-control"
              id="jobId"
              name="jobId"
              value={formData.jobId}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="currentBranch" className="form-label">Current Branch</label>
            <input
              type="text"
              className="form-control"
              id="currentBranch"
              name="currentBranch"
              value={formData.currentBranch}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="currentPosition" className="form-label">Current Position</label>
            <input
              type="text"
              className="form-control"
              id="currentPosition"
              name="currentPosition"
              value={formData.currentPosition}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="desiredPosition" className="form-label">Desired Position</label>
            <input
              type="text"
              className="form-control"
              id="desiredPosition"
              name="desiredPosition"
              value={formData.desiredPosition}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="mb-3">
          <label htmlFor="reason" className="form-label">Reason for Application</label>
          <textarea
            className="form-control"
            id="reason"
            name="reason"
            rows={4}
            value={formData.reason}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="d-grid">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
      
      <div className="mt-4 alert alert-info">
        <h5>What happens next?</h5>
        <p>Upon submission, your application will be:</p>
        <ol>
          <li>Automatically matched with your employee record in our HR system</li>
          <li>Evaluated based on your current PMS scores and experience</li>
          <li>Reviewed by your manager and district manager</li>
          <li>Processed for the promotion eligibility criteria</li>
        </ol>
      </div>
    </div>
  );
};

export default InternalApplication; 