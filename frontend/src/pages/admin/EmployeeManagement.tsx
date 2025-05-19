import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/AuthContext';
import MainHeader from '../../components/MainHeader';
import AdminHeader from '../../components/AdminHeader';
import { employeeAPI } from '../../services/api';
import '../../styles/AdminPages.css';

interface Employee {
  id: string | number;
  fileNumber: string;
  fullName: string;
  sex: string;
  jobGrade: string;
  jobCategory: string;
  currentPosition: string;
  branch: string;
  department: string;
  district: string;
  region: string;
  educationalLevel: string;
  fieldOfStudy: string;
  individualPMS?: number;
  tmdrec20?: number;
  disrec15?: number;
  totalexp20?: number;
  employmentDate: string;
}

const EmployeeManagement: React.FC = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [message, setMessage] = useState<{ text: string, type: string } | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const [formData, setFormData] = useState<Partial<Employee>>({
    id: '',
    fileNumber: '',
    fullName: '',
    sex: '',
    jobGrade: '',
    jobCategory: '',
    currentPosition: '',
    branch: '',
    department: '',
    district: '',
    region: '',
    educationalLevel: '',
    fieldOfStudy: '',
    employmentDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        const data = await employeeAPI.getAll();
        console.log('Employee data loaded:', data);
        setEmployees(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (error) {
        console.error('Error loading employees:', error);
        setMessage({ 
          text: error instanceof Error ? error.message : 'Failed to load employees', 
          type: 'error' 
        });
        setEmployees([]);
        setLoading(false);
      }
    };
    
    loadEmployees();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateEmployee = () => {
    setEditingEmployee(null);
    setFormData({
      id: '',
      fileNumber: '',
      fullName: '',
      sex: '',
      jobGrade: '',
      jobCategory: '',
      currentPosition: '',
      branch: '',
      department: '',
      district: '',
      region: '',
      educationalLevel: '',
      fieldOfStudy: ''
    });
    setShowForm(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      id: employee.id,
      fileNumber: employee.fileNumber,
      fullName: employee.fullName,
      sex: employee.sex,
      jobGrade: employee.jobGrade,
      jobCategory: employee.jobCategory,
      currentPosition: employee.currentPosition,
      branch: employee.branch,
      department: employee.department,
      district: employee.district,
      region: employee.region,
      educationalLevel: employee.educationalLevel,
      fieldOfStudy: employee.fieldOfStudy
    });
    setShowForm(true);
  };

  const handleViewEmployee = (employee: Employee) => {
    // Redirect to employee detail page or show modal
    alert(`Viewing employee: ${employee.fullName}`);
  };

  const handleDeleteEmployee = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      setLoading(true);
      await employeeAPI.delete(id);
      setEmployees(employees.filter(emp => String(emp.id) !== String(id)));
      setMessage({ text: 'Employee deleted successfully', type: 'success' });
      setLoading(false);
    } catch (error) {
      console.error('Error deleting employee:', error);
      setMessage({ 
        text: error instanceof Error ? error.message : 'Failed to delete employee', 
        type: 'error' 
      });
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.id || !formData.fileNumber || !formData.fullName || !formData.sex || !formData.employmentDate) {
      setMessage({ text: 'Please fill all required fields', type: 'error' });
      return;
    }
    
    // Validate ID
    if (formData.id && (Number(formData.id) <= 0 || !Number.isInteger(Number(formData.id)))) {
      setMessage({ text: 'ID must be a positive integer', type: 'error' });
      return;
    }
    
    try {
      setLoading(true);
      // Prepare data for the backend - ensure ID is a number
      const dataForBackend = {
        ...formData,
        id: Number(formData.id) // Convert ID to number
      };
      
      if (editingEmployee) {
        // Update existing employee
        const updatedEmployee = await employeeAPI.update(
          Number(formData.id), 
          dataForBackend
        );
        setEmployees(employees.map(emp => emp.id === editingEmployee.id ? updatedEmployee : emp));
        setMessage({ text: 'Employee updated successfully', type: 'success' });
      } else {
        // Create new employee with ID from form
        const newEmployee = await employeeAPI.create(dataForBackend);
        setEmployees([...employees, newEmployee]);
        setMessage({ text: 'Employee created successfully', type: 'success' });
      }
      
      setShowForm(false);
      setLoading(false);
    } catch (error) {
      console.error('Error saving employee:', error);
      setMessage({ 
        text: error instanceof Error ? error.message : 'Failed to save employee', 
        type: 'error' 
      });
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = (employee.fullName || '').toLowerCase();
    const fileNumber = (employee.fileNumber || '').toLowerCase();
    const branch = (employee.branch || '').toLowerCase();
    const department = (employee.department || '').toLowerCase();
    const position = (employee.currentPosition || '').toLowerCase();
    const district = (employee.district || '').toLowerCase();
    
    return fullName.includes(searchLower) || 
           fileNumber.includes(searchLower) || 
           branch.includes(searchLower) || 
           department.includes(searchLower) || 
           position.includes(searchLower) || 
           district.includes(searchLower);
  });

  return (
    <div className="dashboard-container">
      <MainHeader />
      
      <div className="admin-page">
        <AdminHeader />

        <div className="page-content">
          <div className="page-header">
            <h2>Employee Management</h2>
            <button className="create-btn" onClick={handleCreateEmployee}>
              Add New Employee
            </button>
          </div>
          
          {message && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          {showForm && (
            <div className="form-container">
              <h3>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h3>
              <form onSubmit={handleSubmit} className="data-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="id">ID<span className="required">*</span></label>
                    <input
                      type="number"
                      id="id"
                      name="id"
                      value={formData.id || ''}
                      onChange={handleInputChange}
                      required
                      min="1"
                      step="1"
                    />
                    <small className="field-hint">Must be a positive integer</small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="fileNumber">File Number<span className="required">*</span></label>
                    <input
                      type="text"
                      id="fileNumber"
                      name="fileNumber"
                      value={formData.fileNumber || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fullName">Full Name<span className="required">*</span></label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="sex">Sex<span className="required">*</span></label>
                    <select
                      id="sex"
                      name="sex"
                      value={formData.sex || ''}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Sex</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="jobGrade">Job Grade</label>
                    <input
                      type="text"
                      id="jobGrade"
                      name="jobGrade"
                      value={formData.jobGrade || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="jobCategory">Job Category</label>
                    <input
                      type="text"
                      id="jobCategory"
                      name="jobCategory"
                      value={formData.jobCategory || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="currentPosition">Current Position</label>
                    <input
                      type="text"
                      id="currentPosition"
                      name="currentPosition"
                      value={formData.currentPosition || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="branch">Branch</label>
                    <input
                      type="text"
                      id="branch"
                      name="branch"
                      value={formData.branch || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="department">Department</label>
                    <input
                      type="text"
                      id="department"
                      name="department"
                      value={formData.department || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="district">District</label>
                    <select
                      id="district"
                      name="district"
                      value={formData.district || ''}
                      onChange={handleInputChange}
                    >
                      <option value="">Select District</option>
                      <option value="East Addis District">East Addis District</option>
                      <option value="West Addis District">West Addis District</option>
                      <option value="North Addis District">North Addis District</option>
                      <option value="South Addis District">South Addis District</option>
                      <option value="Central Ethiopia District">Central Ethiopia District</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="region">Region</label>
                    <input
                      type="text"
                      id="region"
                      name="region"
                      value={formData.region || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="educationalLevel">Educational Level</label>
                    <select
                      id="educationalLevel"
                      name="educationalLevel"
                      value={formData.educationalLevel || ''}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Education Level</option>
                      <option value="High School">High School</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Bachelors">Bachelors</option>
                      <option value="Masters">Masters</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fieldOfStudy">Field of Study</label>
                    <input
                      type="text"
                      id="fieldOfStudy"
                      name="fieldOfStudy"
                      value={formData.fieldOfStudy || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="employmentDate">Employment Date<span className="required">*</span></label>
                    <input
                      type="date"
                      id="employmentDate"
                      name="employmentDate"
                      value={formData.employmentDate || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    {editingEmployee ? 'Update Employee' : 'Create Employee'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by name, file number, branch, department, position, or district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="loading">Loading employees...</div>
          ) : filteredEmployees.length === 0 ? (
            <div className="no-data">
              {searchTerm ? 'No employees match your search criteria' : 'No employees found. Add new employees to get started.'}
            </div>
          ) : (
            <div className="data-list">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>File #</th>
                    <th>Full Name</th>
                    <th>Branch</th>
                    <th>Position</th>
                    <th>Job Grade</th>
                    <th>PMS Score</th>
                    <th>Total Score</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(employee => (
                    <tr key={employee.id} className="data-row">
                      <td>{employee.fileNumber}</td>
                      <td>{employee.fullName}</td>
                      <td>{employee.branch}</td>
                      <td>{employee.currentPosition}</td>
                      <td>{employee.jobGrade}</td>
                      <td>{employee.individualPMS || '-'}</td>
                      <td>{calculateTotalScore(employee)}</td>
                      <td className="actions-cell">
                        <button className="action-btn view-btn" onClick={() => handleViewEmployee(employee)}>
                          View
                        </button>
                        <button className="action-btn edit-btn" onClick={() => handleEditEmployee(employee)}>
                          Edit
                        </button>
                        <button className="action-btn delete-btn" onClick={() => handleDeleteEmployee(employee.id)}>
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

// Helper function to calculate total score
const calculateTotalScore = (employee: Employee): string => {
  let total = 0;
  
  if (employee.individualPMS) total += employee.individualPMS * 0.25;
  if (employee.tmdrec20) total += employee.tmdrec20;
  if (employee.disrec15) total += employee.disrec15;
  if (employee.totalexp20) total += employee.totalexp20;
  
  return total > 0 ? total.toFixed(2) : '-';
};

export default EmployeeManagement; 