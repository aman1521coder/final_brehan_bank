import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';
import MainHeader from '../../components/MainHeader';
import AdminHeader from '../../components/AdminHeader';
import '../../styles/AdminPages.css';

const ApplicationsView: React.FC = () => {
  const { user } = useAuth();
  const { jobId } = useParams<Record<string, string>>();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [job, setJob] = useState<any>(null);
  const [internalApplications, setInternalApplications] = useState<any[]>([]);
  const [externalApplications, setExternalApplications] = useState<any[]>([]);
  const [message, setMessage] = useState<{ text: string, type: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'internal' | 'external'>('internal');

  useEffect(() => {
    // In a real implementation, this would fetch job and applications from the API
    setTimeout(() => {
      setLoading(false);
      setJob({
        id: jobId,
        title: 'Branch Manager',
        department: 'Banking Operations',
        location: 'East Addis Branch',
        status: 'Open'
      });

      // Mock data for applications
      setInternalApplications([
        { id: 1, firstName: 'Abebe', lastName: 'Kebede', position: 'Assistant Manager', branch: 'Central Branch', experience: '5 years', matchedEmployee: 'Abebe Kebede' },
        { id: 2, firstName: 'Tigist', lastName: 'Mekonnen', position: 'Supervisor', branch: 'West Branch', experience: '4 years', matchedEmployee: 'Tigist Mekonnen' },
      ]);

      setExternalApplications([
        { id: 1, firstName: 'Samuel', lastName: 'Tesfaye', education: 'MBA Finance', experience: '7 years', email: 'samuel.t@example.com' },
        { id: 2, firstName: 'Hiwot', lastName: 'Amare', education: 'BSc Banking', experience: '3 years', email: 'hiwot.a@example.com' },
        { id: 3, firstName: 'Daniel', lastName: 'Haile', education: 'MSc Economics', experience: '5 years', email: 'daniel.h@example.com' },
      ]);
    }, 1000);
  }, [jobId]);

  return (
    <div className="dashboard-container">
      <MainHeader />
      
      <div className="admin-page">
        <AdminHeader />

        <div className="page-content">
          <div className="page-header">
            <h2>Applications for {job?.title || 'Job'}</h2>
            <div className="job-details">
              {job && (
                <span>
                  <strong>Department:</strong> {job.department} | 
                  <strong> Location:</strong> {job.location} | 
                  <strong> Status:</strong> {job.status}
                </span>
              )}
            </div>
          </div>
          
          {message && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          {loading ? (
            <div className="loading">Loading applications...</div>
          ) : (
            <>
              <div className="tabs">
                <button 
                  className={`tab-btn ${activeTab === 'internal' ? 'active' : ''}`}
                  onClick={() => setActiveTab('internal')}
                >
                  Internal Applications ({internalApplications.length})
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'external' ? 'active' : ''}`}
                  onClick={() => setActiveTab('external')}
                >
                  External Applications ({externalApplications.length})
                </button>
              </div>

              {activeTab === 'internal' && (
                <div className="data-list">
                  {internalApplications.length === 0 ? (
                    <div className="no-data">No internal applications found.</div>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Current Position</th>
                          <th>Branch</th>
                          <th>Experience</th>
                          <th>Matched Employee</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {internalApplications.map(app => (
                          <tr key={app.id} className="data-row">
                            <td>{app.id}</td>
                            <td>{`${app.firstName} ${app.lastName}`}</td>
                            <td>{app.position}</td>
                            <td>{app.branch}</td>
                            <td>{app.experience}</td>
                            <td>
                              {app.matchedEmployee ? (
                                <span className="match-badge">✓ {app.matchedEmployee}</span>
                              ) : (
                                <span className="no-match-badge">No match</span>
                              )}
                            </td>
                            <td className="actions-cell">
                              <button className="action-btn view-btn">
                                View
                              </button>
                              <button className="action-btn process-btn">
                                Process
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {activeTab === 'external' && (
                <div className="data-list">
                  {externalApplications.length === 0 ? (
                    <div className="no-data">No external applications found.</div>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Education</th>
                          <th>Experience</th>
                          <th>Email</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {externalApplications.map(app => (
                          <tr key={app.id} className="data-row">
                            <td>{app.id}</td>
                            <td>{`${app.firstName} ${app.lastName}`}</td>
                            <td>{app.education}</td>
                            <td>{app.experience}</td>
                            <td>{app.email}</td>
                            <td className="actions-cell">
                              <button className="action-btn view-btn">
                                View
                              </button>
                              <button className="action-btn contact-btn">
                                Contact
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </>
          )}

          <div className="coming-soon-overlay">
            <div className="coming-soon-message">
              <h3>Coming Soon</h3>
              <p>Application review functionality is under development.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationsView; 