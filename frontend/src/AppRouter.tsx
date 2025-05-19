import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './services/AuthContext';

// Public pages
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import InternalApplicant from './pages/InternalApplicant';
import ExternalApplicant from './pages/ExternalApplicant';

// Admin pages
import Vacancies from './pages/admin/Vacancies';
import ApplicationLinks from './pages/admin/ApplicationLinks';
import UserManagement from './pages/admin/UserManagement';
import EmployeeManagement from './pages/admin/EmployeeManagement';
import ApplicationsView from './pages/admin/ApplicationsView';

// Private route wrapper component
const PrivateRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { user, loading } = useAuth();
  
  console.log('PrivateRoute: Checking access', { 
    user: user ? `${user.name} (${user.role})` : 'none', 
    loading, 
    allowedRoles 
  });

  if (loading) {
    console.log('PrivateRoute: Still loading auth state');
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    console.log('PrivateRoute: No authenticated user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log(`PrivateRoute: User role ${user.role} not in allowed roles: ${allowedRoles.join(', ')}`);
    return <Navigate to="/dashboard" replace />;
  }

  console.log('PrivateRoute: Access granted');
  return <>{children}</>;
};

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/apply/internal" element={<InternalApplicant />} />
        <Route path="/apply/external" element={<ExternalApplicant />} />
        
        {/* Dashboard route for all authenticated users */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={['admin', 'manager', 'district_manager']}>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/vacancies"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Vacancies />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/application-links"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <ApplicationLinks />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <UserManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/employees"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <EmployeeManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/jobs/:jobId/applications"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <ApplicationsView />
            </PrivateRoute>
          }
        />

        {/* Manager routes */}
        <Route
          path="/manager/dashboard"
          element={
            <PrivateRoute allowedRoles={['manager']}>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/employees"
          element={
            <PrivateRoute allowedRoles={['manager']}>
              {/* TODO: Create ManagerEmployees component */}
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/evaluations"
          element={
            <PrivateRoute allowedRoles={['manager']}>
              {/* TODO: Create ManagerEvaluations component */}
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/vacancies"
          element={
            <PrivateRoute allowedRoles={['manager']}>
              {/* TODO: Create ManagerVacancies component */}
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* District Manager routes */}
        <Route
          path="/district/dashboard"
          element={
            <PrivateRoute allowedRoles={['district_manager']}>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/district/employees"
          element={
            <PrivateRoute allowedRoles={['district_manager']}>
              {/* TODO: Create DistrictEmployees component */}
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/district/recommendations"
          element={
            <PrivateRoute allowedRoles={['district_manager']}>
              {/* TODO: Create DistrictRecommendations component */}
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/district/vacancies"
          element={
            <PrivateRoute allowedRoles={['district_manager']}>
              {/* TODO: Create DistrictVacancies component */}
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Default route redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter; 