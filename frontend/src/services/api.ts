// Base API service for making HTTP requests to the backend

// Connect directly to the backend
const API_URL = 'http://localhost:8080';

// Types
export interface LoginRequest {
  name: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  password: string;
  role: string;
  district?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    role: string;
    district?: string;
  };
}

export interface Employee {
  id: string;
  fileNumber: string;
  fullName: string;
  sex: string;
  position: string;
  jobGrade: string;
  jobCategory: string;
  branch: string;
  department: string;
  district: string;
  region: string;
  educationalLevel: string;
  fieldOfStudy: string;
  currentPosition: string;
  individualPMS?: number;
  tmdrec20?: number;
  disRect15?: number;
  totalexp20?: number;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  qualifications: string;
  department: string;
  location: string;
  jobType: string;
  salary?: number;
  status?: string;
  deadline?: string;
}

// Check if token exists and is valid
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Get the current user from localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error('Error parsing user data:', e);
    return null;
  }
};

// Log out by clearing stored credentials
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login'; // Redirect to login page
};

// Simple fetch wrapper for basic requests
const simpleFetch = async (url: string, options: RequestInit = {}) => {
  try {
    console.log(`Fetching: ${url}`);
    const response = await fetch(url, options);
    console.log(`Response status: ${response.status}`);
    return response;
  } catch (error) {
    console.error('Network error:', error);
    throw new Error('Failed to connect to server. Please check your internet connection.');
  }
};

// Main API request function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  // Get authentication token
  const token = localStorage.getItem('token');
  
  // Build headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  
  // Add auth token if available
  if (token && !endpoint.includes('/public/')) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Build final request configuration
  const requestConfig: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
    mode: 'cors',
  };
  
  // Full URL
  const url = `${API_URL}${endpoint}`;
  
  try {
    console.log(`API Request: ${options.method || 'GET'} ${url}`);
    
    // Make the request
    const response = await simpleFetch(url, requestConfig);
    
    console.log(`Response: ${response.status} ${response.statusText}`);
    
    // Handle 401 Unauthorized (token expired or invalid)
    if (response.status === 401) {
      console.warn('Authentication failed. Token may be expired.');
      
      // If not a login request, attempt to redirect to login
      if (!endpoint.includes('/auth/login')) {
        logout();
        throw new Error('Your session has expired. Please log in again.');
      }
    }
    
    // Handle any other error responses
    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      
      try {
        // Try to extract error details from response
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // If response isn't JSON, try to get text
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = `${errorMessage} - ${errorText.substring(0, 100)}`;
          }
        } catch (e2) {
          // Ignore if we can't get text either
        }
      }
      
      throw new Error(errorMessage);
    }
    
    // Handle 204 No Content
    if (response.status === 204) {
      return {};
    }
    
    // Parse JSON response
    try {
      const data = await response.json();
      return data;
    } catch (e) {
      console.warn('Could not parse JSON response:', e);
      // Return empty object if parsing fails but the request was successful
      return {}; 
    }
  } catch (error) {
    // Rethrow with clear message
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Could not connect to the server. Please check if the backend is running.');
    }
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Save token and user data on successful login
    if (response && response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },
  
  register: (data: RegisterRequest): Promise<AuthResponse> => 
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  logout: () => {
    logout();
    return Promise.resolve({ success: true });
  },
};

// Employee API
export const employeeAPI = {
  getAll: () => 
    apiRequest('/api/employees'),
  
  getById: (id: string) => 
    apiRequest(`/api/employees/${id}`),
  
  getByDistrict: (district: string) => 
    apiRequest(`/api/district/employees?district=${encodeURIComponent(district)}`),
  
  create: (data: Partial<Employee>) => 
    apiRequest('/api/admin/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<Employee>) => 
    apiRequest(`/api/admin/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  updatePMS: (id: string, value: number) => 
    apiRequest(`/api/manager/employees/${id}/pms`, {
      method: 'PATCH',
      body: JSON.stringify({ individualPMS: value }),
    }),
  
  updateManagerRec: (id: string, value: number) => 
    apiRequest(`/api/manager/employees/${id}/recommendation`, {
      method: 'PATCH',
      body: JSON.stringify({ tmdrec20: value }),
    }),
  
  updateDistrictRec: (id: string, value: number) => 
    apiRequest(`/api/district/employees/${id}/recommendation`, {
      method: 'PATCH',
      body: JSON.stringify({ disRect15: value }),
    }),
  
  getEvaluation: (id: string) => 
    apiRequest(`/api/manager/employees/${id}/evaluation`),
  
  search: (query: string) => 
    apiRequest(`/api/employees/search?q=${encodeURIComponent(query)}`),
};

// Job API
export const jobAPI = {
  getAll: () => 
    apiRequest('/api/jobs'),
  
  getById: (id: string) => 
    apiRequest(`/api/jobs/${id}`),
  
  getByType: (type: string) => 
    apiRequest(`/api/jobs/type/${encodeURIComponent(type)}`),
  
  create: (data: Partial<Job>) => 
    apiRequest('/api/admin/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<Job>) => 
    apiRequest(`/api/admin/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) => 
    apiRequest(`/api/admin/jobs/${id}`, {
      method: 'DELETE',
    }),
  
  getApplications: (id: string) => 
    apiRequest(`/api/admin/jobs/${id}/applications`),
};

// Application API
export const applicationAPI = {
  submitInternal: (applicationData: any, resume?: File) => {
    const formData = new FormData();
    if (resume) {
      formData.append('resume', resume);
    }
    formData.append('data', JSON.stringify(applicationData));
    
    return apiRequest('/api/public/apply/internal', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set content-type for multipart/form-data
    });
  },
  
  submitExternal: (applicationData: any, resume?: File) => {
    const formData = new FormData();
    if (resume) {
      formData.append('resume', resume);
    }
    formData.append('data', JSON.stringify(applicationData));
    
    return apiRequest('/api/public/apply/external', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set content-type for multipart/form-data
    });
  },
  
  getAllInternal: () => 
    apiRequest('/api/admin/applications/internal'),
  
  getInternalByJob: (jobId: string) => 
    apiRequest(`/api/admin/applications/internal/${jobId}`),
  
  getAllExternal: () => 
    apiRequest('/api/admin/applications/external'),
  
  getExternalByJob: (jobId: string) => 
    apiRequest(`/api/admin/applications/external/${jobId}`),
};

// Public API
export const publicAPI = {
  getJobs: () => 
    apiRequest('/api/public/jobs'),
  
  ping: () => 
    apiRequest('/ping'),
}; 