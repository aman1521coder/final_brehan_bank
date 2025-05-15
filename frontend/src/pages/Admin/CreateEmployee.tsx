import React, { useState } from 'react';
import { useAuth } from '../../services/AuthContext';
import { employeeAPI } from '../../services/api';

// Define districts
const districts = [
  'East District',
  'East Addis District',
  'West District',
  'West Addis District',
  'North District',
  'North Addis District',
  'South District',
  'South Addis District',
  'Central Ethiopia District Head office'
];

const CreateEmployee: React.FC = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [fileNumber, setFileNumber] = useState('');
  const [sex, setSex] = useState('');
  const [position, setPosition] = useState('');
  const [branch, setBranch] = useState('');
  const [department, setDepartment] = useState('');
  const [district, setDistrict] = useState('');
  const [jobGrade, setJobGrade] = useState('');
  const [jobCategory, setJobCategory] = useState('');
  const [educationalLevel, setEducationalLevel] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [region, setRegion] = useState('');
  const [individualPMS, setIndividualPMS] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Only admin can create employee records
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
      await employeeAPI.create({
        fileNumber,
        fullName,
        sex,
        position: position,
        jobGrade,
        jobCategory,
        branch,
        department,
        district,
        region,
        educationalLevel,
        fieldOfStudy,
        currentPosition: position,
        individualPMS: individualPMS ? parseFloat(individualPMS) : 0
      });
      
      // Clear form and show success message
      setFullName('');
      setFileNumber('');
      setSex('');
      setPosition('');
      setBranch('');
      setDepartment('');
      setDistrict('');
      setJobGrade('');
      setJobCategory('');
      setEducationalLevel('');
      setFieldOfStudy('');
      setRegion('');
      setIndividualPMS('');
      setSuccess('Employee record created successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to create employee record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="page-header">
        <h2>Create Employee Record</h2>
      </div>
      
      <div className="admin-card">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fileNumber">File Number</label>
            <input
              type="text"
              id="fileNumber"
              value={fileNumber}
              onChange={(e) => setFileNumber(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="sex">Sex</label>
            <select
              id="sex"
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              required
            >
              <option value="">Select...</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="position">Position</label>
            <input
              type="text"
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="jobGrade">Job Grade</label>
            <input
              type="text"
              id="jobGrade"
              value={jobGrade}
              onChange={(e) => setJobGrade(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="jobCategory">Job Category</label>
            <input
              type="text"
              id="jobCategory"
              value={jobCategory}
              onChange={(e) => setJobCategory(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="branch">Branch</label>
            <input
              type="text"
              id="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
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
            <label htmlFor="district">District</label>
            <select
              id="district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              required
            >
              <option value="">Select District...</option>
              {districts.map(dist => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="region">Region</label>
            <input
              type="text"
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="individualPMS">Individual PMS Score (25%)</label>
            <input
              type="number"
              id="individualPMS"
              min="0"
              max="25"
              step="0.1"
              value={individualPMS}
              onChange={(e) => setIndividualPMS(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="educationalLevel">Educational Level</label>
            <select
              id="educationalLevel"
              value={educationalLevel}
              onChange={(e) => setEducationalLevel(e.target.value)}
              required
            >
              <option value="">Select...</option>
              <option value="Diploma">Diploma</option>
              <option value="Bachelor's">Bachelor's Degree</option>
              <option value="Master's">Master's Degree</option>
              <option value="PhD">PhD</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="fieldOfStudy">Field of Study</label>
            <input
              type="text"
              id="fieldOfStudy"
              value={fieldOfStudy}
              onChange={(e) => setFieldOfStudy(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Employee...' : 'Create Employee'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEmployee; 