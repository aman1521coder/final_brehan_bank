import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';
import { employeeAPI } from '../../services/api';
import EmployeeCard from '../../components/Employee/EmployeeCard';

const ManageEmployees: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  // List of districts for filtering
  const districts = [
    'All Districts',
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

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await employeeAPI.getAll();
        setEmployees(data);
        setFilteredEmployees(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch employees');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    // Filter employees based on search term and selected district
    let filtered = [...employees];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        employee => 
          employee.fullName?.toLowerCase().includes(term) ||
          employee.fileNumber?.toLowerCase().includes(term) ||
          employee.position?.toLowerCase().includes(term) ||
          employee.department?.toLowerCase().includes(term)
      );
    }
    
    if (selectedDistrict && selectedDistrict !== 'All Districts') {
      filtered = filtered.filter(
        employee => employee.district === selectedDistrict
      );
    }
    
    setFilteredEmployees(filtered);
  }, [searchTerm, selectedDistrict, employees]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDistrict(e.target.value);
  };

  // Only admin can view this page
  if (user?.role !== 'admin') {
    return (
      <div className="error-message">
        You don't have permission to access this page.
      </div>
    );
  }

  if (loading && employees.length === 0) {
    return <div className="loading">Loading employees...</div>;
  }

  return (
    <div className="admin-container">
      <div className="page-header">
        <h2>Manage Employees</h2>
        <Link to="/admin/create-employee" className="btn btn-primary">
          Add New Employee
        </Link>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="filters-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name, file number, position..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        
        <div className="district-filter">
          <select value={selectedDistrict} onChange={handleDistrictChange}>
            <option value="">All Districts</option>
            {districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="employees-count">
        <p>Showing {filteredEmployees.length} of {employees.length} employees</p>
      </div>
      
      <div className="employees-grid">
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map(employee => (
            <EmployeeCard
              key={employee.id}
              id={employee.id}
              fullName={employee.fullName}
              position={employee.currentPosition || employee.position}
              branch={employee.branch}
              department={employee.department}
              district={employee.district}
              individualPMS={employee.individualPMS?.value}
              tmdrec20={employee.tmdrec20?.value}
              disRect15={employee.disrect15?.value}
              totalexp20={employee.total?.value}
              role={user?.role}
            />
          ))
        ) : (
          <div className="no-employees">
            <p>No employees found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageEmployees; 