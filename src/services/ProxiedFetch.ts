// ProxiedFetch.ts - A service to make direct API calls without frontend routing interference

// Backend URL - direct connection to backend
const BACKEND_URL = 'http://localhost:8080';

// Direct API call that bypasses frontend routing and directly calls the backend
export const directApiCall = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<any> => {
  const fullUrl = `${BACKEND_URL}${endpoint}`;
  console.log(`Direct API call to: ${fullUrl}`);
  
  try {
    // Make the request with explicit CORS settings
    const response = await fetch(fullUrl, {
      ...options,
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      }
    });
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return { 
        success: response.ok, 
        status: response.status, 
        data 
      };
    } else {
      const text = await response.text();
      return { 
        success: false, 
        status: response.status, 
        data: text,
        error: 'Response was not JSON'
      };
    }
  } catch (error: any) {
    console.error('Direct API call error:', error);
    return {
      success: false,
      error: error.message || 'Network error',
      status: 0
    };
  }
};

// Test a direct API connection (useful for debugging)
export const testDirectApiConnection = async (): Promise<boolean> => {
  try {
    const { success } = await directApiCall('/ping');
    console.log(`API connection test ${success ? 'succeeded' : 'failed'}`);
    return success;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};

// Test any endpoint directly and return detailed results
export const testEndpoint = async (endpoint: string, method: string = 'GET', body?: any): Promise<any> => {
  try {
    const options: RequestInit = {
      method,
      ...(body && { body: JSON.stringify(body) })
    };
    
    const result = await directApiCall(endpoint, options);
    console.log(`Test for ${endpoint} (${method}):`, result);
    return result;
  } catch (error) {
    console.error(`Test failed for ${endpoint}:`, error);
    return {
      success: false,
      error: String(error)
    };
  }
}; 