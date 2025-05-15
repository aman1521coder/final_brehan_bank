import React, { useState } from 'react';
import { testEndpoint } from '../services/ProxiedFetch';

const ApiTest: React.FC = () => {
  const [testUrl, setTestUrl] = useState('/ping');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [useCors, setUseCors] = useState(true);
  const [useCredentials, setUseCredentials] = useState(true);
  const [useProxy, setUseProxy] = useState(true);

  const testConnection = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      console.log(`Testing API connection to: ${testUrl} (CORS: ${useCors}, Credentials: ${useCredentials}, Proxy: ${useProxy})`);
      
      const baseUrl = useProxy ? 'http://localhost:3001' : '';
      const fullUrl = `${baseUrl}${testUrl}`;
      
      const options: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
        }
      };
      
      // Add CORS options if enabled
      if (useCors) {
        options.mode = 'cors';
      }
      
      // Add credentials if enabled
      if (useCredentials) {
        options.credentials = 'include';
      }
      
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

  // Test using the direct API service
  const testWithDirectService = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const endpointToTest = useProxy ? testUrl : `http://localhost:3001${testUrl}`;
      const result = await testEndpoint(endpointToTest);
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

  // Test with raw XMLHttpRequest for debugging
  const testWithXhr = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', testUrl);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onload = function() {
      setLoading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          setResult(JSON.stringify(data, null, 2));
        } catch (e) {
          setResult(xhr.responseText);
          if (xhr.responseText.includes('<!DOCTYPE html>')) {
            setError('Received HTML instead of JSON. This typically means you hit a frontend route instead of an API endpoint.');
          }
        }
      } else {
        setError(`Error ${xhr.status}: ${xhr.statusText}`);
      }
    };
    
    xhr.onerror = function() {
      setLoading(false);
      setError('Network error occurred');
    };
    
    xhr.send();
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
          Test Direct API
        </button>
      </div>
      
      <div className="api-test-options">
        <label>
          <input 
            type="checkbox" 
            checked={useCors} 
            onChange={(e) => setUseCors(e.target.checked)}
          /> 
          Use CORS mode
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={useCredentials} 
            onChange={(e) => setUseCredentials(e.target.checked)}
          /> 
          Include credentials
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={useProxy} 
            onChange={(e) => setUseProxy(e.target.checked)}
          /> 
          Use proxy
        </label>
        <button onClick={testWithXhr} className="btn btn-sm" disabled={loading}>
          Test with XMLHttpRequest
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
          <li>Test without CORS: <button onClick={() => setUseCors(false)} className="btn btn-sm">Disable CORS</button></li>
          <li>Test without Credentials: <button onClick={() => setUseCredentials(false)} className="btn btn-sm">Disable Credentials</button></li>
          <li>For direct API testing (no CORS), try using an API tool like Postman</li>
        </ul>
        {useProxy && (
          <div className="proxy-notice">
            <strong>Using proxy:</strong> All requests are being sent through http://localhost:3001
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiTest; 