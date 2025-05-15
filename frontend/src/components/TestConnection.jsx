import React, { useState, useEffect } from 'react';

const TestConnection = () => {
  const [status, setStatus] = useState('Checking connection...');
  const [error, setError] = useState(null);
  const [corsTest, setCorsTest] = useState(null);
  const [responseHeaders, setResponseHeaders] = useState(null);

  useEffect(() => {
    // Test direct fetch to backend
    const testConnection = async () => {
      try {
        console.log('Testing direct fetch to backend');
        const response = await fetch('http://localhost:8080/ping', {
          mode: 'cors',
          credentials: 'include'
        });
        
        // Get headers as object
        const headers = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });
        setResponseHeaders(headers);
        
        if (response.ok) {
          setStatus(`Backend responded with status: ${response.status}`);
        } else {
          setStatus(`Backend error: ${response.status} ${response.statusText}`);
        }
      } catch (err) {
        console.error('Connection test failed:', err);
        setError(err.message);
        setStatus('Connection failed');
      }
    };

    // Test CORS specifically
    const testCORS = async () => {
      try {
        console.log('Testing CORS with preflight request');
        const response = await fetch('http://localhost:8080/api/auth/login', {
          method: 'OPTIONS',
          mode: 'cors',
          headers: {
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type',
          }
        });
        
        setCorsTest(`CORS preflight response: ${response.status} ${response.statusText}`);
      } catch (err) {
        console.error('CORS test failed:', err);
        setCorsTest(`CORS test failed: ${err.message}`);
      }
    };

    testConnection();
    testCORS();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Connection Test Tool</h2>
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h3>Backend Status</h3>
        <p><strong>Status:</strong> {status}</p>
        {error && <p style={{ color: 'red' }}><strong>Error:</strong> {error}</p>}
      </div>
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h3>CORS Test</h3>
        <p>{corsTest || 'Testing CORS...'}</p>
      </div>
      
      {responseHeaders && (
        <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
          <h3>Response Headers</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflowX: 'auto' }}>
            {JSON.stringify(responseHeaders, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h3>Debug Information</h3>
        <p>Backend URL: http://localhost:8080</p>
        <p>Browser: {navigator.userAgent}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Refresh Test
        </button>
      </div>
    </div>
  );
};

export default TestConnection; 