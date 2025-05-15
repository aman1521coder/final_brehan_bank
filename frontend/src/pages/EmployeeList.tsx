import React, { useEffect, useState } from 'react';
import { useAuth } from '../services/AuthContext';
import { employeeAPI } from '../services/api';
import EmployeeCard from '../components/Employee/EmployeeCard';

const EmployeeList: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch employees based on user role
        let data;
        if (user?.role === 'district_manager') {
          // District managers only see employees in their district
          data = await employeeAPI.getByDistrict(user.district || '');
          setFilterDistrict(user.district || '');
        } else {
          // Regular employees, managers, and admins see all employees
          data = await employeeAPI.getAll();
        }
        
        setEmployees(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load employees');
        console.error('Employee list error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployees();
  }, [user]);

  // Filter employees based on search term and district
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = searchTerm === '' || 
      (employee.fullName && employee.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (employee.fileNumber && employee.fileNumber.includes(searchTerm));
    
    const matchesDistrict = filterDistrict === '' || 
      (employee.district && employee.district === filterDistrict);
    
    return matchesSearch && matchesDistrict;
  });

  if (loading) {
    return <div className="loading">Loading employees...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="employee-list-container">
      <div className="page-header">
        <h2>Employees</h2>
        {user?.role === 'admin' && (
          <button className="btn btn-primary">Add Employee</button>
        )}
      </div>
      
      <div className="filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name or file number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {user?.role !== 'district_manager' && (
          <div className="district-filter">
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
            >
              <option value="">All Districts</option>
              <option value="East District">East District</option>
              <option value="East Addis District">East Addis District</option>
              <option value="West District">West District</option>
              <option value="West Addis District">West Addis District</option>
              <option value="North District">North District</option>
              <option value="North Addis District">North Addis District</option>
              <option value="South District">South District</option>
              <option value="South Addis District">South Addis District</option>
              <option value="Central Ethiopia District Head office">Central Ethiopia District Head office</option>
            </select>
          </div>
        )}
      </div>
      
      {filteredEmployees.length === 0 ? (
        <div className="no-data">No employees found</div>
      ) : (
        <div className="employee-list">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              id={employee.id}
              fullName={employee.fullName || 'No Name'}
              position={employee.position || 'No Position'}
              branch={employee.branch}
              district={employee.district}
              fileNumber={employee.fileNumber}
              individualPMS={employee.individualPMS}
              tmdrec20={employee.tmdrec20}
              disRect15={employee.disRect15}
              totalexp20={employee.totalexp20}
              role={user?.role}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeList; 