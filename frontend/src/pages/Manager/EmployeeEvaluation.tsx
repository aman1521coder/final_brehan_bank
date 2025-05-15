import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';
import { employeeAPI } from '../../services/api';

interface RouteParams {
  id: string;
}

const EmployeeEvaluation: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const history = useHistory();
  const { user } = useAuth();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pmsValue, setPmsValue] = useState<number | ''>('');
  const [managerRecValue, setManagerRecValue] = useState<number | ''>('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const data = await employeeAPI.getEvaluation(parseInt(id, 10));
        setEmployee(data);
        
        // Pre-fill form with existing values if available
        if (data.individual_pms) {
          setPmsValue(data.individual_pms);
        }
        if (data.manager_rec) {
          setManagerRecValue(data.manager_rec);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch employee data');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const handlePMSUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pmsValue === '') return;
    
    try {
      setLoading(true);
      await employeeAPI.updatePMS(parseInt(id, 10), Number(pmsValue));
      setSuccess('Individual PMS updated successfully');
      
      // Refresh employee data
      const data = await employeeAPI.getEvaluation(parseInt(id, 10));
      setEmployee(data);
    } catch (err: any) {
      setError(err.message || 'Failed to update PMS');
    } finally {
      setLoading(false);
    }
  };

  const handleManagerRecUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (managerRecValue === '') return;
    
    try {
      setLoading(true);
      await employeeAPI.updateManagerRecommendation(parseInt(id, 10), Number(managerRecValue));
      setSuccess('Manager recommendation updated successfully');
      
      // Refresh employee data
      const data = await employeeAPI.getEvaluation(parseInt(id, 10));
      setEmployee(data);
    } catch (err: any) {
      setError(err.message || 'Failed to update recommendation');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'manager' && user?.role !== 'admin' && user?.role !== 'district_manager') {
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
    <div className="employee-evaluation-container">
      <div className="page-header">
        <h2>Employee Evaluation: {employee.employee_name}</h2>
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
              <div className="stat-label">Individual PMS (25%)</div>
              <div className="stat-value">{employee.indpms25 || "Not evaluated"}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Experience Score (20%)</div>
              <div className="stat-value">{employee.totalexp20 || "Not evaluated"}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Manager Recommendation (20%)</div>
              <div className="stat-value">{employee.manager_rec || "Not evaluated"}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">District Recommendation (15%)</div>
              <div className="stat-value">{employee.district_rec || "Not evaluated"}</div>
            </div>
            <div className="stat-item total">
              <div className="stat-label">Total Score</div>
              <div className="stat-value">{employee.total_score || "Incomplete"}</div>
            </div>
          </div>
        </div>

        {(user?.role === 'manager' || user?.role === 'admin') && (
          <div className="evaluation-forms">
            <div className="evaluation-form-section">
              <h3>Update Individual PMS</h3>
              <form onSubmit={handlePMSUpdate}>
                <div className="form-group">
                  <label htmlFor="pmsValue">Individual PMS Score (0-100)</label>
                  <input
                    type="number"
                    id="pmsValue"
                    min="0"
                    max="100"
                    value={pmsValue}
                    onChange={(e) => setPmsValue(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading || pmsValue === ''}
                >
                  Update PMS
                </button>
              </form>
            </div>

            <div className="evaluation-form-section">
              <h3>Update Manager Recommendation</h3>
              <form onSubmit={handleManagerRecUpdate}>
                <div className="form-group">
                  <label htmlFor="managerRecValue">Manager Recommendation Score (0-100)</label>
                  <input
                    type="number"
                    id="managerRecValue"
                    min="0"
                    max="100"
                    value={managerRecValue}
                    onChange={(e) => setManagerRecValue(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading || managerRecValue === ''}
                >
                  Update Recommendation
                </button>
              </form>
            </div>
          </div>
        )}

        {user?.role === 'district_manager' && (
          <div className="district-manager-view">
            <p>As a District Manager, you can update the district recommendation score for this employee from the District Manager dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeEvaluation; 