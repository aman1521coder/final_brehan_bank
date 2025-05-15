import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';
import { employeeAPI } from '../../services/api';

interface RouteParams {
  id: string;
}

const DistrictManagerEvaluation: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const history = useHistory();
  const { user } = useAuth();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [districtRecValue, setDistrictRecValue] = useState<number | ''>('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const data = await employeeAPI.getEvaluation(parseInt(id, 10));
        setEmployee(data);
        
        // Pre-fill form with existing values if available
        if (data.district_rec) {
          setDistrictRecValue(data.district_rec);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch employee data');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const handleDistrictRecUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (districtRecValue === '') return;
    
    try {
      setLoading(true);
      await employeeAPI.updateDistrictRec(parseInt(id, 10), Number(districtRecValue));
      setSuccess('District recommendation updated successfully');
      
      // Refresh employee data
      const data = await employeeAPI.getEvaluation(parseInt(id, 10));
      setEmployee(data);
    } catch (err: any) {
      setError(err.message || 'Failed to update district recommendation');
    } finally {
      setLoading(false);
    }
  };

  // Only district managers can access this page
  if (user?.role !== 'district_manager') {
    return (
      <div className="error-message">
        You don't have permission to access this page.
      </div>
    );
  }

  if (loading && !employee) {
    return <div className="loading">Loading employee data...</div>;
  }

  if (error && !employee) {
    return <div className="error-message">{error}</div>;
  }

  if (!employee) {
    return <div className="error-message">Employee not found</div>;
  }

  return (
    <div className="district-evaluation-container">
      <div className="page-header">
        <h2>District Evaluation: {employee.employee_name}</h2>
        <button className="btn btn-secondary" onClick={() => history.goBack()}>
          Back
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="evaluation-card">
        <div className="evaluation-summary">
          <h3>Evaluation Summary</h3>
          <div className="evaluation-stats">
            <div className="stat-item">
              <div className="stat-label">Employee ID</div>
              <div className="stat-value">{employee.employee_id}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Manager Recommendation Score (20%)</div>
              <div className="stat-value">{employee.manager_rec || "Not evaluated"}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">District Recommendation (15%)</div>
              <div className="stat-value">{employee.district_rec || "Not evaluated"}</div>
            </div>
          </div>
        </div>

        <div className="evaluation-form-section">
          <h3>Update District Recommendation</h3>
          <form onSubmit={handleDistrictRecUpdate}>
            <div className="form-group">
              <label htmlFor="districtRecValue">District Recommendation Score (0-100)</label>
              <input
                type="number"
                id="districtRecValue"
                min="0"
                max="100"
                value={districtRecValue}
                onChange={(e) => setDistrictRecValue(e.target.value === '' ? '' : Number(e.target.value))}
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || districtRecValue === ''}
            >
              Update District Recommendation
            </button>
          </form>
        </div>

        <div className="important-notice">
          <h4>Important</h4>
          <p>
            Your recommendation accounts for 15% of the employee's total evaluation score. 
            Please ensure your assessment is fair and objective.
          </p>
          <p>
            The employee should already have a manager recommendation score before you provide your assessment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DistrictManagerEvaluation; 