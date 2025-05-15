import React, { useEffect, useState } from 'react';
import { useAuth } from '../services/AuthContext';
import { employeeAPI, jobAPI } from '../services/api';
import { Link, useHistory } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-content">
        <h3>{title}</h3>
        <p className="stat-value">{value}</p>
        {trend && (
          <div className={`trend ${trend.isPositive ? 'positive' : 'negative'}`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}%
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      history.push('/login');
    }
  }, [user, authLoading, history]);

  // Fetch dashboard data
  useEffect(() => {
    // Don't fetch data until we confirm user is authenticated
    if (authLoading || !user) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch employees based on user role
        let employeeData;
        if (user.role === 'district_manager' && user.district) {
          // District managers only see employees in their district
          employeeData = await employeeAPI.getByDistrict(user.district);
        } else {
          // Regular employees, managers, and admins see all employees
          employeeData = await employeeAPI.getAll();
        }
        
        setEmployees(employeeData || []);
        
        // Fetch jobs
        const jobsData = await jobAPI.getAll();
        setJobs(jobsData || []);
      } catch (err: any) {
        console.error('Dashboard data fetch error:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  if (!user) {
    return null; // Will redirect to login
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button 
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome, {user.name}</h2>
        <div className="user-info">
          <p>Role: {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
          {user.district && <p>District: {user.district}</p>}
        </div>
        <div className="dashboard-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      </div>
      
      <div className="stats-grid">
        <StatCard 
          title="Total Employees" 
          value={employees.length} 
          icon="👥"
          trend={{ value: 5.2, isPositive: true }}
        />
        <StatCard 
          title="Open Jobs" 
          value={jobs.filter(job => job.status === 'open').length || jobs.length} 
          icon="📋"
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard 
          title="Applications" 
          value={jobs.reduce((sum, job) => sum + (job.applicationCount || 0), 0) || '0'} 
          icon="📝"
          trend={{ value: 8.7, isPositive: true }}
        />
        <StatCard 
          title="Pending Reviews" 
          value={employees.filter(emp => !emp.individualPMS).length || '0'} 
          icon="⏳"
          trend={{ value: 3.1, isPositive: false }}
        />
      </div>
      
      {/* Admin Dashboard Section */}
      {user.role === 'admin' && (
        <div className="dashboard-section">
          <h3>Admin Tools</h3>
          <div className="admin-actions">
            <h4>User Management</h4>
            <div className="admin-action-group">
              <Link to="/admin/create-user" className="btn btn-primary">Create User Account</Link>
              <Link to="/admin/manage-users" className="btn">Manage User Accounts</Link>
            </div>
            
            <h4>Employee Management</h4>
            <div className="admin-action-group">
              <Link to="/admin/create-employee" className="btn btn-primary">Create Employee Record</Link>
              <Link to="/admin/manage-employees" className="btn">Manage Employees</Link>
            </div>
            
            <h4>Job Management</h4>
            <div className="admin-action-group">
              <Link to="/admin/create-job" className="btn btn-primary">Create Job Posting</Link>
              <Link to="/admin/manage-jobs" className="btn">Manage Job Listings</Link>
              <Link to="/admin/applications" className="btn">Review Applications</Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Manager Dashboard Section */}
      {user.role === 'manager' && (
        <div className="dashboard-section">
          <h3>Manager Tools</h3>
          <div className="manager-actions">
            <Link to="/manager/employees" className="btn btn-primary">Employee PMS Reviews</Link>
            <Link to="/manager/employees/evaluations" className="btn">Team Performance</Link>
            <Link to="/jobs" className="btn">View Job Listings</Link>
          </div>
        </div>
      )}
      
      {/* District Manager Dashboard */}
      {user.role === 'district_manager' && (
        <div className="dashboard-section">
          <h3>District: {user.district}</h3>
          <div className="district-actions">
            <Link to="/district/employees" className="btn btn-primary">District Employees</Link>
            <Link to="/district/evaluations" className="btn">District Evaluations</Link>
            <Link to="/jobs" className="btn">View Job Listings</Link>
          </div>
        </div>
      )}
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Recent Activity</h3>
          </div>
          <div className="card-content">
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">📝</div>
                <div className="activity-content">
                  <p className="activity-title">New job posting created</p>
                  <p className="activity-meta">Today, 10:30 AM</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">👤</div>
                <div className="activity-content">
                  <p className="activity-title">New employee added</p>
                  <p className="activity-meta">Today, 9:15 AM</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">✅</div>
                <div className="activity-content">
                  <p className="activity-title">Employee PMS review completed</p>
                  <p className="activity-meta">Yesterday, 5:45 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Recent Job Postings</h3>
          </div>
          <div className="card-content">
            <div className="job-list">
              {jobs.slice(0, 3).map((job, index) => (
                <div key={job.id || index} className="job-item">
                  <div className="job-info">
                    <h4>{job.title || 'Job Title'}</h4>
                    <p>{job.department || 'Department'}</p>
                  </div>
                  <span className="job-type">{job.jobType || job.job_type || 'Type'}</span>
                </div>
              ))}
              
              {jobs.length === 0 && (
                <p className="no-data">No job postings available</p>
              )}
            </div>
            
            <div className="view-all">
              <Link to="/jobs">View All Jobs</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 