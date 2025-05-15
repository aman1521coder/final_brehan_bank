import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import Login from './components/Login';
import TestConnection from './components/TestConnection';
import Dashboard from './pages/Dashboard';
import CreateUser from './pages/Admin/CreateUser';
import CreateEmployee from './pages/Admin/CreateEmployee';
import CreateJob from './pages/Admin/CreateJob';
import ManageUsers from './pages/Admin/ManageUsers';
import ManageEmployees from './pages/Admin/ManageEmployees';
import ManageJobs from './pages/Admin/ManageJobs';
import JobListings from './pages/JobListings';
import JobDetail from './pages/JobDetail';
import EmployeeEvaluation from './pages/Manager/EmployeeEvaluation';
import DistrictManagerEvaluation from './pages/District/DistrictManagerEvaluation';
import ManagerLogin from './pages/Manager/ManagerLogin';
import DistrictManagerLogin from './pages/District/DistrictManagerLogin';
import { AuthProvider } from './services/AuthContext';
import './styles/main.css';
import './styles/job.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <header className="header">
            <div className="container">
              <div className="logo">
                <h1>Bank HR System</h1>
              </div>
              <nav className="navigation">
                <ul>
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/login">Login</Link></li>
                  <li><Link to="/manager/login">Manager Login</Link></li>
                  <li><Link to="/district/login">District Manager Login</Link></li>
                  <li><Link to="/test">Test Connection</Link></li>
                </ul>
              </nav>
            </div>
          </header>
          
          <main className="main-content">
            <div className="container">
              <Switch>
                <Route path="/login" component={Login} />
                <Route path="/manager/login" component={ManagerLogin} />
                <Route path="/district/login" component={DistrictManagerLogin} />
                <Route path="/test" component={TestConnection} />
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/admin/dashboard" component={Dashboard} />
                <Route path="/admin/create-user" component={CreateUser} />
                <Route path="/admin/create-employee" component={CreateEmployee} />
                <Route path="/admin/create-job" component={CreateJob} />
                <Route path="/admin/manage-users" component={ManageUsers} />
                <Route path="/admin/manage-employees" component={ManageEmployees} />
                <Route path="/admin/manage-jobs" component={ManageJobs} />
                <Route path="/manager/employees/:id/evaluation" component={EmployeeEvaluation} />
                <Route path="/manager/employees/:id/pms" component={EmployeeEvaluation} />
                <Route path="/manager/employees/:id/recommendation" component={EmployeeEvaluation} />
                <Route path="/district/employees/:id/evaluation" component={DistrictManagerEvaluation} />
                <Route path="/district/employees/:id/recommendation" component={DistrictManagerEvaluation} />
                <Route path="/jobs" component={JobListings} />
                <Route path="/jobs/:id" component={JobDetail} />
                <Route path="/" exact>
                  <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <h2>Welcome to the Bank HR System</h2>
                    <p>Please <Link to="/login">login</Link> to continue.</p>
                    <p>Having connection issues? <Link to="/test">Test your connection</Link> to the backend.</p>
                  </div>
                </Route>
              </Switch>
            </div>
          </main>
          
          <footer className="footer">
            <div className="container">
              <div className="copyright">
                © 2025 Bank HR System. All rights reserved.
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App; 