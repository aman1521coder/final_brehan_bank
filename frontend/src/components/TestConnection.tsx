import React, { useState, useEffect } from 'react';
import { publicAPI } from '../services/api';

const TestConnection: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [backendUrl, setBackendUrl] = useState('http://localhost:8080');
  const [backendVersion, setBackendVersion] = useState('');
  const [testTime, setTestTime] = useState(new Date());

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setStatus('loading');
    setMessage('Testing connection to backend...');
    setTestTime(new Date());
    
    try {
      const response = await publicAPI.ping();
      console.log('Ping response:', response);
      
      if (response) {
        setStatus('success');
        setMessage('Connection successful! Backend server is running.');
        if (response.version) {
          setBackendVersion(response.version);
        }
      } else {
        setStatus('error');
        setMessage('Received empty response from backend server.');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setStatus('error');
      setMessage(error.message || 'Failed to connect to backend server.');
    }
  };

  return (
    <div className="test-connection">
      <h2>Backend Connection Test</h2>
      
      <div className="test-info">
        <div className="info-row">
          <span className="info-label">Backend URL:</span>
          <span className="info-value">{backendUrl}</span>
        </div>
        
        <div className="info-row">
          <span className="info-label">Test Time:</span>
          <span className="info-value">{testTime.toLocaleString()}</span>
        </div>
        
        {backendVersion && (
          <div className="info-row">
            <span className="info-label">Backend Version:</span>
            <span className="info-value">{backendVersion}</span>
          </div>
        )}
      </div>
      
      <div className={`test-result test-${status}`}>
        {status === 'loading' && <div className="loader"></div>}
        {status === 'success' && <div className="success-icon">✅</div>}
        {status === 'error' && <div className="error-icon">❌</div>}
        <p className="status-message">{message}</p>
      </div>
      
      <div className="test-actions">
        <button 
          className="btn btn-primary" 
          onClick={testConnection}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Testing...' : 'Test Connection Again'}
        </button>
      </div>
      
      {status === 'error' && (
        <div className="troubleshooting">
          <h3>Troubleshooting Steps:</h3>
          <ol>
            <li>Check if the backend server is running on port 8080</li>
            <li>Verify CORS is properly configured in the backend</li>
            <li>Check for network connectivity issues or firewalls</li>
            <li>Examine browser console for specific error messages</li>
            <li>Try accessing the ping endpoint directly: <a href="http://localhost:8080/ping" target="_blank" rel="noopener noreferrer">http://localhost:8080/ping</a></li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default TestConnection;