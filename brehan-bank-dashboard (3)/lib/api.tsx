import axios from "axios"

// Define interfaces
export interface LoginCredentials {
  name: string;
  password: string;
  role?: string;
  district?: string;
}

export interface User {
  id: string;
  name: string;
  role: string;
  district?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Update API URL to use port 8080 instead of 3001
const API_URL = typeof window !== 'undefined' ? 
  (window.location.protocol + '//' + window.location.hostname + ':8080/api') : 
  'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Helper function to get auth token
const getAuthToken = (): string => {
  if (typeof window === 'undefined') return '';
  
  let token = localStorage.getItem('token') || '';
  
  // Clean the token by removing 'bearer ' or 'Bearer ' if present
  if (token.toLowerCase().startsWith('bearer ')) {
    token = token.substring(7); // Remove 'bearer ' (7 characters)
  }
  
  return token;
}

// Debug function to check token
export const debugToken = () => {
  const token = localStorage.getItem('token') || '';
  console.log('Current token in localStorage:', token);
  console.log('Token after cleaning:', getAuthToken());
  console.log('Token has "bearer" prefix:', token.toLowerCase().startsWith('bearer '));
  return { 
    raw: token, 
    cleaned: getAuthToken(),
    hasPrefix: token.toLowerCase().startsWith('bearer ')
  };
}

// Add request interceptor to automatically add auth header
api.interceptors.request.use(
  (config) => {
    // Skip auth header for login requests
    if (config.url && config.url.includes('/auth/login')) {
      return config;
    }
    
    const token = getAuthToken();
    if (token) {
      // Always use proper format: "Bearer " + token (with space)
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Adding auth header to:', config.url);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log('401 Unauthorized - clearing token');
      // Redirect to login page
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Job API functions
export const jobAPI = {
  // Get all jobs
  getAllJobs: async (params = {}) => {
    try {
      const token = getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await api.get("/jobs", { 
        params,
        headers
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching jobs:", error);
      throw error;
    }
  },

  // Get a single job by ID
  getJobById: async (id: string) => {
    try {
      const token = getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await api.get(`/jobs/${id}`, { headers });
      return response.data;
    } catch (error) {
      console.error(`Error fetching job ${id}:`, error);
      throw error;
    }
  },

  // Create a new job
  createJob: async (jobData: any) => {
    try {
      const token = getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await api.post("/jobs", jobData, { headers });
      return response.data;
    } catch (error) {
      console.error("Error creating job:", error);
      throw error;
    }
  },

  // Update a job
  updateJob: async (id: string, jobData: any) => {
    try {
      const token = getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await api.put(`/jobs/${id}`, jobData, { headers });
      return response.data;
    } catch (error) {
      console.error(`Error updating job ${id}:`, error);
      throw error;
    }
  },

  // Delete a job
  deleteJob: async (id: string) => {
    try {
      const token = getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await api.delete(`/jobs/${id}`, { headers });
      return response.data;
    } catch (error) {
      console.error(`Error deleting job ${id}:`, error);
      throw error;
    }
  },

  // Get applications for a job
  getApplicationsForJob: async (jobId: string) => {
    try {
      const response = await api.get(`/jobs/${jobId}/applications`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching applications for job ${jobId}:`, error);
      throw error;
    }
  },

  // Process job application
  submitApplication: async (jobId: string, applicationType: string, applicationData: any) => {
    try {
      const response = await api.post(`/jobs/${jobId}/apply/${applicationType}`, applicationData);
      return response.data;
    } catch (error) {
      console.error(`Error submitting application for job ${jobId}:`, error);
      throw error;
    }
  },
}

// Department API functions
export const departmentAPI = {
  getAllDepartments: async () => {
    try {
      const token = getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await api.get("/departments", { headers });
      return response.data;
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw error;
    }
  },
}

// User API functions
export const userAPI = {
  getProfile: async () => {
    try {
      const token = getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await api.get("/users/profile", { headers });
      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  updateProfile: async (userData: any) => {
    try {
      const token = getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await api.put("/users/profile", userData, { headers });
      return response.data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },
}

// Employee API functions
export const employeeAPI = {
  getAllEmployees: async () => {
    try {
      const token = getAuthToken();
      // IMPORTANT: The backend error shows it doesn't want 'bearer ' in token
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      console.log('Getting employees with headers:', headers);
      
      // Debug the token and headers
      console.log('Debug - Token from localStorage:', localStorage.getItem('token'));
      console.log('Debug - Cleaned token:', token);
      console.log('Debug - Headers being sent:', headers);
      
      // Use the correct API endpoint
      const response = await api.get("/employees", { 
        headers,
        // Add more debugging
        validateStatus: function (status) {
          console.log('Response status:', status);
          return status < 500; // Resolve only if status is less than 500
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching employees:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
        console.error("Response headers:", error.response.headers);
      }
      throw error;
    }
  },
  
  getEmployeeById: async (id: string) => {
    try {
      const token = getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await api.get(`/employees/${id}`, { headers });
      return response.data;
    } catch (error) {
      console.error(`Error fetching employee ${id}:`, error);
      throw error;
    }
  },
}

// Auth API functions
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      // Log what we're sending to the API
      console.log("Login API call with:", { ...credentials, password: '*****' });
      
      // Make the request
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      
      console.log("Login API response status:", response.status);
      
      // Store token directly as returned from backend
      if (response.data && response.data.token) {
        // Store token WITH 'Bearer ' prefix for API calls
        localStorage.setItem('token', `Bearer ${response.data.token}`);
        
        // Also store user data
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        console.log('Token saved:', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  isAuthenticated: () => {
    return !!getAuthToken();
  }
}

export default {
  authAPI,
  employeeAPI,
  jobAPI,
  userAPI,
  departmentAPI
}; 