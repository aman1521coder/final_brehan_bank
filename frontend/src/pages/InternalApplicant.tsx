import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applicationAPI } from '../services/api';
import '../styles/Applicant.css';

const InternalApplicant: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [job, setJob] = useState<any>(null);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPosition: '',
    branch: '',
    department: '',
    yearsOfExperience: '',
    reason: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  
  // Get job ID from URL query parameter
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const jobId = params.get('job');
  const token = params.get('token');
  
  useEffect(() => {
    if (!jobId || !token) {
      setMessage({ 
        text: 'Invalid application link. Please contact HR for assistance.', 
        type: 'error' 
      });
      return;
    }
    
    const fetchJobDetails = async () => {
      try {
        // This would be a real API call in production
        setJob({
          id: jobId,
          title: 'Branch Manager',
          department: 'Banking Operations',
          location: 'East Addis Branch',
          requirements: 'Minimum 3 years experience in banking operations. Bachelor\'s degree in Finance or related field.',
          description: 'Responsible for overall branch operations and staff management.'
        });
      } catch (error) {
        console.error('Error fetching job details:', error);
        setMessage({ text: 'Failed to load job details', type: 'error' });
      }
    };
    
    fetchJobDetails();
  }, [jobId, token]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      // Prepare application data
      const applicationData = {
        ...formData,
        jobId,
        applicationToken: token
      };
      
      // Call API to submit application
      await applicationAPI.submitInternal(applicationData, resumeFile || undefined);
      
      setMessage({ text: 'Your application has been submitted successfully!', type: 'success' });
      setSubmitted(true);
    } catch (error: any) {
      console.error('Error submitting application:', error);
      setMessage({ 
        text: error.message || 'An error occurred submitting your application. Please try again.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!jobId || !token) {
    return (
      <div className="applicant-container">
        <header className="applicant-header">
          <div className="applicant-logo"></div>
          <h1>Berhan Bank Job Application</h1>
        </header>
        <div className="error-message">
          Invalid application link. Please contact HR for assistance.
        </div>
      </div>
    );
  }
  
  return (
    <div className="applicant-container">
      <header className="applicant-header">
        <div className="applicant-logo"></div>
        <h1>Berhan Bank Internal Job Application</h1>
      </header>
      
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      {job && !submitted && (
        <div className="job-details">
          <h2>{job.title}</h2>
          <div className="job-info">
            <span><strong>Department:</strong> {job.department}</span>
            <span><strong>Location:</strong> {job.location}</span>
          </div>
          <div className="job-description">
            <h3>Job Description</h3>
            <p>{job.description}</p>
          </div>
          <div className="job-requirements">
            <h3>Requirements</h3>
            <p>{job.requirements}</p>
          </div>
        </div>
      )}
      
      {!submitted ? (
        <form onSubmit={handleSubmit} className="application-form">
          <h2>Internal Application Form</h2>
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="currentPosition">Current Position</label>
            <input
              type="text"
              id="currentPosition"
              name="currentPosition"
              value={formData.currentPosition}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="branch">Current Branch</label>
            <input
              type="text"
              id="branch"
              name="branch"
              value={formData.branch}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="department">Current Department</label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="yearsOfExperience">Years of Experience at Berhan Bank</label>
            <input
              type="number"
              id="yearsOfExperience"
              name="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={handleInputChange}
              required
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="reason">Why are you interested in this position?</label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              required
              rows={5}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="resume">Upload Your Resume (PDF or Word)</label>
            <input
              type="file"
              id="resume"
              name="resume"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
            />
            <small>Maximum file size: 5MB</small>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      ) : (
        <div className="application-success">
          <h2>Application Submitted Successfully!</h2>
          <p>Thank you for applying for this position at Berhan Bank. Your application has been received.</p>
          <p>Our HR team will review your application and contact you regarding the next steps. If you have any questions, please contact HR department.</p>
        </div>
      )}
      
      <footer className="applicant-footer">
        <p>© {new Date().getFullYear()} Berhan Bank. All rights reserved.</p>
        <p>For technical support, please contact HR department.</p>
      </footer>
    </div>
  );
};

export default InternalApplicant; 