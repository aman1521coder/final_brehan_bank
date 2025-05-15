import React, { useState } from 'react';
import { testEndpoint } from '../services/ProxiedFetch';

const ApiTest: React.FC = () => {
  const [testUrl, setTestUrl] = useState('/ping');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      console.log(`Testing direct API connection to: ${testUrl}`);
      
      const options: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'include'
      };
      
      // Full URL for direct connection
      const fullUrl = `http://localhost:8080${testUrl}`;
      
      const response = await fetch(fullUrl, options);
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setResult(JSON.stringify(data, null, 2));
      } else {
        const text = await response.text();
        setResult(text);
        if (text.includes('<!DOCTYPE html>')) {
          setError('Received HTML instead of JSON. This typically means you hit a frontend route instead of an API endpoint.');
        }
      }
    } catch (err: any) {
      console.error('API test error:', err);
      setError(err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Test using ProxiedFetch
  const testWithDirectService = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const result = await testEndpoint(testUrl);
      setResult(JSON.stringify(result, null, 2));
      if (!result.success) {
        setError(result.error || 'API request failed');
      }
    } catch (err: any) {
      console.error('Direct API test error:', err);
      setError(err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="api-test">
      <h3>API Connection Test</h3>
      <div className="api-test-form">
        <input 
          type="text" 
          value={testUrl} 
          onChange={(e) => setTestUrl(e.target.value)} 
          placeholder="API endpoint to test"
          className="api-test-input"
        />
        <button 
          onClick={testConnection} 
          disabled={loading} 
          className="btn btn-primary"
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </button>
        <button 
          onClick={testWithDirectService}
          disabled={loading}
          className="btn btn-primary"
        >
          Test with ProxiedFetch
        </button>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="result-container">
          <h4>Result:</h4>
          <pre>{result}</pre>
        </div>
      )}
      
      <div className="api-test-tips">
        <h4>Troubleshooting Tips:</h4>
        <ul>
          <li>Make sure your backend is running on port 8080</li>
          <li>Try testing the ping endpoint first: <button onClick={() => setTestUrl('/ping')} className="btn btn-sm">Use /ping</button></li>
          <li>Check the browser console for detailed error messages</li>
          <li>Test the login endpoint: <button onClick={() => setTestUrl('/api/auth/login')} className="btn btn-sm">Use /api/auth/login</button></li>
        </ul>
        <div className="direct-notice">
          <strong>Direct connection:</strong> All requests are being sent directly to http://localhost:8080
        </div>
      </div>
    </div>
  );
};

export default ApiTest; 