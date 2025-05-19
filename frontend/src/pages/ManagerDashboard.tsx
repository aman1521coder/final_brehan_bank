import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Employee {
  id: number;
  full_name: string;
  file_number: string;
  job_grade: string;
  department: string;
  indpms25: number;
  tmdrec20: number;
  totalexp20: number;
  total_score: number;
}

const ManagerDashboard: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [pmsScore, setPmsScore] = useState<number>(0);
  const [managerRec, setManagerRec] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch employees for the manager's department
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // For demo purposes, using a dummy department - in production, get this from auth
        const department = "Credit";
        const response = await axios.get(`/api/employees/department?department=${department}`);
        setEmployees(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load employees. Please try again later.');
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setPmsScore(employee.indpms25 * 4 || 0); // Convert back from 25% to the actual score
    setManagerRec(employee.tmdrec20 * 5 || 0); // Convert back from 20% to the actual score
  };

  const handlePmsSubmit = async () => {
    if (!selectedEmployee) return;
    
    try {
      await axios.put(`/api/employees/${selectedEmployee.id}/pms`, {
        individual_pms: pmsScore
      });
      setSuccessMessage('PMS score updated successfully!');
      
      // Refresh employee data
      const updatedEmployees = [...employees];
      const index = updatedEmployees.findIndex(emp => emp.id === selectedEmployee.id);
      if (index !== -1) {
        updatedEmployees[index] = {
          ...updatedEmployees[index],
          indpms25: pmsScore * 0.25
        };
        setEmployees(updatedEmployees);
      }

      // Clear message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError('Failed to update PMS score. Please try again.');
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const handleManagerRecSubmit = async () => {
    if (!selectedEmployee) return;
    
    try {
      await axios.put(`/api/employees/${selectedEmployee.id}/manager-recommendation`, {
        manager_recommendation: managerRec
      });
      setSuccessMessage('Manager recommendation updated successfully!');
      
      // Refresh employee data
      const updatedEmployees = [...employees];
      const index = updatedEmployees.findIndex(emp => emp.id === selectedEmployee.id);
      if (index !== -1) {
        updatedEmployees[index] = {
          ...updatedEmployees[index],
          tmdrec20: managerRec * 0.20
        };
        setEmployees(updatedEmployees);
      }

      // Clear message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError('Failed to update manager recommendation. Please try again.');
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <h2>Manager Dashboard</h2>
      <p>Manage employee evaluations and performance scores (25% weight)</p>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      
      <div className="row mt-4">
        <div className="col-md-6">
          <h3>Employees in Your Department</h3>
          <div className="list-group">
            {employees.length > 0 ? (
              employees.map(employee => (
                <button
                  key={employee.id}
                  className={`list-group-item list-group-item-action ${selectedEmployee?.id === employee.id ? 'active' : ''}`}
                  onClick={() => handleSelectEmployee(employee)}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5>{employee.full_name}</h5>
                      <small>File: {employee.file_number} | Grade: {employee.job_grade}</small>
                    </div>
                    <div className="text-end">
                      <span className="badge bg-primary">PMS: {employee.indpms25 ? (employee.indpms25 * 4).toFixed(1) : 'N/A'}</span>
                      <span className="badge bg-info ms-2">Rec: {employee.tmdrec20 ? (employee.tmdrec20 * 5).toFixed(1) : 'N/A'}</span>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <p>No employees found in your department.</p>
            )}
          </div>
        </div>
        
        <div className="col-md-6">
          {selectedEmployee ? (
            <div className="card">
              <div className="card-header">
                <h4>{selectedEmployee.full_name} - Evaluation</h4>
              </div>
              <div className="card-body">
                <h5>Individual PMS Score (25%)</h5>
                <div className="input-group mb-3">
                  <input
                    type="number"
                    className="form-control"
                    value={pmsScore}
                    onChange={(e) => setPmsScore(Number(e.target.value))}
                    min="0"
                    max="100"
                  />
                  <button className="btn btn-primary" onClick={handlePmsSubmit}>Save PMS</button>
                </div>
                
                <h5 className="mt-4">Manager Recommendation (20%)</h5>
                <div className="input-group mb-3">
                  <input
                    type="number"
                    className="form-control"
                    value={managerRec}
                    onChange={(e) => setManagerRec(Number(e.target.value))}
                    min="0"
                    max="100"
                  />
                  <button className="btn btn-success" onClick={handleManagerRecSubmit}>Save Recommendation</button>
                </div>
                
                <div className="mt-4">
                  <h5>Current Evaluation Summary</h5>
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <td>PMS Score (25%)</td>
                        <td>{selectedEmployee.indpms25 ? selectedEmployee.indpms25.toFixed(2) : '0.00'}</td>
                      </tr>
                      <tr>
                        <td>Experience (20%)</td>
                        <td>{selectedEmployee.totalexp20 ? selectedEmployee.totalexp20.toFixed(2) : '0.00'}</td>
                      </tr>
                      <tr>
                        <td>Manager Rec (20%)</td>
                        <td>{selectedEmployee.tmdrec20 ? selectedEmployee.tmdrec20.toFixed(2) : '0.00'}</td>
                      </tr>
                      <tr className="table-primary">
                        <td><strong>Current Total</strong></td>
                        <td><strong>{selectedEmployee.total_score ? selectedEmployee.total_score.toFixed(2) : '0.00'}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-info">Select an employee to evaluate</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard; 