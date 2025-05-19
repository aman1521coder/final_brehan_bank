// Base API service for making HTTP requests to the backend

// Connect directly to the backend
const API_URL = 'http://localhost:8080';

// Types
export interface LoginRequest {
  name: string;
  password: string;
  role: string;
  district?: string;
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
  id: string | number;
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
  employmentDate: string;
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

// Check if token exists
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
    console.log(`Fetching: ${url}`, options);
    
    // Add a timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const fetchOptions = {
      ...options,
      signal: controller.signal
    };
    
    try {
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);
      console.log(`Response status: ${response.status}`);
      return response;
    } catch (e) {
      clearTimeout(timeoutId);
      if (e instanceof DOMException && e.name === 'AbortError') {
        throw new Error('Request timed out. Server may be unreachable.');
      }
      throw e;
    }
  } catch (error) {
    console.error('Network error:', error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error(`Failed to connect to server at ${url.split('/').slice(0, 3).join('/')}. Please ensure the backend is running.`);
    }
    throw new Error(`Failed to connect to server: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Main API request function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  // Get authentication token
  const token = localStorage.getItem('token');
  
  console.log('API Request to:', endpoint);
  console.log('Token available:', !!token);
  
  // Build headers
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  
  // Add auth token if available
  if (token && !endpoint.includes('/public/')) {
    console.log('Using token for request');
    // Make sure token is formatted correctly (Bearer prefix)
    const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    headers.set('Authorization', formattedToken);
  }
  
  // Build final request configuration
  const requestConfig: RequestInit = {
    ...options,
    headers,
    mode: 'cors',
    // No credentials for wildcard CORS
  };
  
  // Full URL - ensure no double slashes for cleaner URLs and no trailing slashes
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // Remove trailing slash if present to match backend route normalization
  const normalizedPath = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
  const url = `${baseUrl}${normalizedPath}`;
  
  console.log('Full request URL:', url);
  console.log('Request method:', options.method || 'GET');
  console.log('Headers:', Object.fromEntries(headers.entries()));
  
  try {
    // Make the request
    const response = await fetch(url, requestConfig);
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    // Handle 401 Unauthorized (token expired or invalid)
    if (response.status === 401) {
      console.warn('Authentication failed. Token may be expired or invalid.');
      console.warn('Endpoint that caused 401:', endpoint);
      console.warn('Request method:', options.method || 'GET');
      
      // Try to get response body for more details
      try {
        const errorData = await response.clone().json();
        console.warn('401 response data:', errorData);
      } catch (e) {
        console.warn('Could not parse 401 response body');
      }
      
      // If not a login request, redirect to login
      if (!endpoint.includes('/auth/login')) {
        console.warn('Not a login endpoint, removing auth data and redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Your session has expired. Please log in again.');
      }
    }
    
    if (response.status === 404) {
      console.error(`Endpoint not found: ${url}`);
      throw new Error(`API endpoint not found: ${endpoint}`);
    }
    
    // Return empty array for GET collection endpoints that return 404
    if (response.status === 404 && options.method === 'GET' && 
        (endpoint.includes('/users') || endpoint.includes('/employees'))) {
      console.warn(`Endpoint not found, returning empty array: ${url}`);
      return [];
    }
    
    // For non-JSON responses (like 204 No Content)
    if (response.status === 204) {
      return { success: true };
    }
    
    // Parse JSON response
    try {
      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      return { success: response.ok };
    }
    
  } catch (error) {
    // Rethrow with clear message
    console.error('API request error:', error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Could not connect to the server. Please check if the backend is running.');
    }
    throw error;
  }
};

// Mock data for development
const MOCK_USERS = [
  { id: '1', name: 'Admin User', role: 'admin' },
  { id: '2', name: 'Manager User', role: 'manager' },
  { id: '3', name: 'District Manager', role: 'district_manager', district: 'East Addis District' },
];

const MOCK_EMPLOYEES = [
  { 
    id: '1', 
    fileNumber: 'EMP001', 
    fullName: 'John Doe', 
    sex: 'Male',
    jobGrade: 'Senior',
    jobCategory: 'Management',
    currentPosition: 'Branch Manager',
    branch: 'East Addis',
    department: 'Operations',
    district: 'East Addis District',
    region: 'Addis Ababa',
    educationalLevel: 'Masters',
    fieldOfStudy: 'Business Administration',
    individualPMS: 85,
    tmdrec20: 17,
    disRect15: 12,
    totalexp20: 15,
    employmentDate: new Date().toISOString().split('T')[0]
  },
  { 
    id: '2', 
    fileNumber: 'EMP002', 
    fullName: 'Jane Smith', 
    sex: 'Female',
    jobGrade: 'Mid-level',
    jobCategory: 'Customer Service',
    currentPosition: 'Customer Service Rep',
    branch: 'West Addis',
    department: 'Customer Service',
    district: 'West Addis District',
    region: 'Addis Ababa',
    educationalLevel: 'Bachelors',
    fieldOfStudy: 'Marketing',
    individualPMS: 78,
    tmdrec20: 15,
    disRect15: 11,
    totalexp20: 10,
    employmentDate: new Date().toISOString().split('T')[0]
  }
];

// Auth API
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      // Real API implementation
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      if (response && response.token) {
        // Make sure token is properly formatted
        const token = response.token.startsWith('Bearer ') ? response.token : `Bearer ${response.token}`;
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },
  
  register: (data: RegisterRequest): Promise<AuthResponse> => 
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  logout: () => {
    // Call backend logout endpoint without trailing slash
    const promise = apiRequest('/api/auth/logout', {
      method: 'POST',
    }).catch(err => {
      console.warn('Logout API error (continuing anyway):', err);
      // Continue with local logout even if API call fails
      return { success: true };
    }).finally(() => {
      // Clear all auth data regardless of API response
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('Logged out, auth data cleared');
    });
    
    return promise;
  },
  
  // Validate the current token
  validate: async (): Promise<boolean> => {
    try {
      if (!localStorage.getItem('token')) {
        return false;
      }
      
      // Try to get user profile with current token - remove trailing slash
      const response = await apiRequest('/api/auth/me');
      return !!response && !!response.user;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  },
};

// Employee API
export const employeeAPI = {
  getAll: () => {
    console.log('Fetching all employees...');
    
    // Try simplified endpoint first, as it's more likely to work
    return apiRequest('/api/admin/employees')
      .then(simpleData => {
        console.log('Simple employees API response:', simpleData);
        if (simpleData && Array.isArray(simpleData) && simpleData.length > 0) {
          console.log('Successfully retrieved simple employees data');
          
          // Normalize field names to handle case inconsistencies
          return simpleData.map(emp => {
            // Handle case inconsistencies in field names
            const normalized = { ...emp };
            
            // Convert backend camelCase to frontend camelCase if needed
            if (emp.file_number !== undefined) normalized.fileNumber = emp.file_number;
            if (emp.full_name !== undefined) normalized.fullName = emp.full_name;
            if (emp.job_grade !== undefined) normalized.jobGrade = emp.job_grade;
            if (emp.job_category !== undefined) normalized.jobCategory = emp.job_category;
            if (emp.current_position !== undefined) normalized.currentPosition = emp.current_position;
            if (emp.educational_level !== undefined) normalized.educationalLevel = emp.educational_level;
            if (emp.field_of_study !== undefined) normalized.fieldOfStudy = emp.field_of_study;
            if (emp.individual_pms !== undefined) normalized.individualPMS = emp.individual_pms;
            
            // Handle case variations in district recommendation
            if (emp.disrect15 !== undefined) normalized.disRect15 = emp.disrect15;
            if (emp.disRect15 !== undefined) normalized.disRect15 = emp.disRect15;
            
            return normalized;
          });
        }
        
        // If simple endpoint failed or returned empty, try the full endpoint
        console.log('Simple endpoint failed or empty, trying full endpoint');
        return apiRequest('/api/employees')
          .then(data => {
            console.log('Employees API response:', data);
            if (!data || !Array.isArray(data)) {
              console.warn('API returned invalid data format for employees, using mock data');
              return MOCK_EMPLOYEES;
            }
            return data;
          })
          .catch(error => {
            console.warn('Failed to get employees from full endpoint:', error);
            return MOCK_EMPLOYEES;
          });
      })
      .catch(error => {
        console.warn('Failed to get employees from simple endpoint, trying full endpoint:', error);
        
        // Try the full endpoint as fallback
        return apiRequest('/api/employees')
          .then(data => {
            console.log('Employees API response from fallback:', data);
            if (!data || !Array.isArray(data)) {
              console.warn('API returned invalid data format for employees, using mock data');
              return MOCK_EMPLOYEES;
            }
            return data;
          })
          .catch(err => {
            console.warn('All endpoints failed, using mock data:', err);
            return MOCK_EMPLOYEES;
          });
      });
  },
  
  getById: (id: string | number) => {
    // Remove the development mode check to ensure real API calls
    return apiRequest(`/api/employees/${id}`)
      .catch(error => {
        console.warn(`Failed to get employee ${id}:`, error);
        // Fall back to mock data only if API call fails
        const employee = MOCK_EMPLOYEES.find(e => String(e.id) === String(id));
        return employee || null;
      });
  },
  
  getByDistrict: (district: string) => 
    apiRequest(`/api/district/employees?district=${encodeURIComponent(district)}`),
  
  create: (data: Partial<Employee>) => {
    // Remove the development mode check
    return apiRequest('/api/admin/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  update: (id: string | number, data: Partial<Employee>) => {
    // Remove the development mode check
    return apiRequest(`/api/admin/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  delete: (id: string | number) => {
    // Remove the development mode check
    return apiRequest(`/api/admin/employees/${id}`, {
      method: 'DELETE',
    });
  },
  
  updatePMS: (id: string | number, value: number) => 
    apiRequest(`/api/manager/employees/${id}/pms`, {
      method: 'PATCH',
      body: JSON.stringify({ individualPMS: value }),
    }),
  
  updateManagerRec: (id: string | number, value: number) => 
    apiRequest(`/api/manager/employees/${id}/recommendation`, {
      method: 'PATCH',
      body: JSON.stringify({ tmdrec20: value }),
    }),
  
  updateDistrictRec: (id: string | number, value: number) => 
    apiRequest(`/api/district/employees/${id}/recommendation`, {
      method: 'PATCH',
      body: JSON.stringify({ disRect15: value }),
    }),
  
  getEvaluation: (id: string | number) => 
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

// User API
export const userAPI = {
  getAll: () => {
    console.log('Fetching all users from admin endpoint...');
    
    // Use only the admin endpoint, not trying fallbacks which confuses the system
    return apiRequest('/api/admin/users')
      .then(data => {
        console.log('Users API response:', data);
        
        // Handle null/undefined response (convert to empty array)
        if (!data) {
          console.warn('API returned null/undefined for users, using empty array');
          return [];
        }
        
        // Handle non-array responses (should be an array)
        if (!Array.isArray(data)) {
          console.warn('API returned non-array data for users:', data);
          return MOCK_USERS;
        }
        
        // Array is returned but might be empty
        console.log(`Successfully retrieved ${data.length} users`);
        return data.map(user => ({
          id: user.id,
          name: user.name,
          role: user.role || 'unknown',
          district: user.district
        }));
      })
      .catch(error => {
        console.error('Failed to get users:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText
        });
        
        // Return mock data in case of error
        console.warn('Falling back to mock users');
        return MOCK_USERS;
      });
  },
  
  getById: (id: string) => {
    console.log(`Fetching user with ID: ${id}`);
    
    return apiRequest(`/api/admin/users/${id}`)
      .then(data => {
        console.log('User API response:', data);
        return data;
      })
      .catch(error => {
        console.warn(`Failed to get user ${id}, using mock data as fallback:`, error);
        // Fallback to mock data if API fails
        const user = MOCK_USERS.find(u => u.id === id);
        return user || null;
      });
  },
  
  create: (data: any) => {
    console.log('Creating user with data:', data);
    
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    .then(response => {
      console.log('User creation response:', response);
      return response;
    })
    .catch(error => {
      console.error('User creation failed with error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText
      });
      throw error;
    });
  },
    
  update: (id: string, data: Partial<RegisterRequest>) => {
    console.log(`Updating user ${id} with data:`, data);
    
    return apiRequest(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    .then(response => {
      console.log('User update response:', response);
      return response;
    })
    .catch(error => {
      console.warn(`Failed to update user ${id}:`, error);
      // Return mock result as fallback
      return { ...data, id };
    });
  },
    
  delete: (id: string) => {
    console.log(`Deleting user with ID: ${id}`);
    
    return apiRequest(`/api/admin/users/${id}`, {
      method: 'DELETE',
    })
    .then(response => {
      console.log('User deletion response:', response);
      return response;
    })
    .catch(error => {
      console.warn(`Failed to delete user ${id}:`, error);
      return { success: false, error: error.message };
    });
  },
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