import axios, { type AxiosResponse } from "axios"

// API base URL - configurable via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include credentials (cookies) with all requests
})

// Add these functions at the top to help with debugging
export function debugToken(): { raw: string, cleaned: string, hasPrefix: boolean } {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Token is null or undefined");
    return { raw: "", cleaned: "", hasPrefix: false };
  }
  
  try {
    // Log first part of token for debugging
    console.log("Token first 15 chars:", token.substring(0, 15) + "...");
    
    // Check token structure for JWT
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn("Token doesn't appear to be a standard JWT (should have 3 parts)");
    }
    
    // Check if token has bearer prefix
    const hasPrefix = token.toLowerCase().startsWith('bearer ');
    let cleaned = token;
    
    // Remove prefix if present
    if (hasPrefix) {
      cleaned = token.substring(7);
    }
    
    return {
      raw: token,
      cleaned,
      hasPrefix
    };
  } catch (e) {
    console.error("Error inspecting token:", e);
    return { raw: token, cleaned: token, hasPrefix: false };
  }
}

// Ensure token is properly formatted for the Go backend
function getAuthorizationHeader(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    console.log("No token found for API request");
    return undefined;
  }
  
  // Debug the token
  const debugResult = debugToken();

  // IMPORTANT: Go backend now requires the "Bearer " prefix
  if (!token.toLowerCase().startsWith('bearer ')) {
    console.log("Adding 'Bearer ' prefix to token for API call");
    return `Bearer ${debugResult.cleaned.trim()}`;
  }
  
  return token.trim(); // Keep the "Bearer " prefix
}

// Before each request, verify and log the token
api.interceptors.request.use(
  (config) => {
    // Don't add auth headers to auth endpoint requests
    if (config.url && config.url.includes('/api/auth/')) {
      return config;
    }
    
    const token = localStorage.getItem("token");
    if (token) {
      // Ensure token is properly formatted (WITH "Bearer " prefix for this backend)
      const formattedToken = getFormattedToken();
      if (formattedToken) {
        config.headers['Authorization'] = formattedToken; // This now sends the token WITH Bearer prefix
        
        // Debug log for troubleshooting
        console.log(`Adding auth header to ${config.method?.toUpperCase()} ${config.url}`);
        console.log(`Token has Bearer prefix: ${formattedToken.toLowerCase().startsWith('bearer ')}`);
        
        // Double check cookie is also set
        const hasCookie = document.cookie.includes('token=');
        if (!hasCookie) {
          console.warn("Token in localStorage but not in cookie - fixing");
          document.cookie = `token=${token};path=/;max-age=${60*60*24*7}`;
        }
      }
      
      // Add district header for district manager endpoints
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if ((user.role === 'district_manager' || user.role === 'district') && user.district) {
            console.log("Adding district header:", user.district);
            config.headers['X-District'] = user.district;
          }
        } catch (e) {
          console.error("Error parsing user data for district:", e);
        }
      }
    } else {
      console.warn("No token available for request:", config.url);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.error("401 Unauthorized error caught in interceptor");
      
      // Check if we're at the login page already
      const isLoginPage = window.location.pathname === '/login';
      if (!isLoginPage) {
        console.log("Not on login page, redirecting...");
        
        // Clear auth tokens
        localStorage.removeItem("token");
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        // Check for redirect loop
        const loginAttempts = parseInt(localStorage.getItem("loginAttempts") || "0");
        if (loginAttempts > 2) {
          console.error("Detected login redirect loop! Stopping redirect.");
          localStorage.setItem("loginAttempts", "0");
          // Add error to local storage to display on login page
          localStorage.setItem("authError", "Login redirect loop detected. Token format may be incorrect.");
          
          // Try to diagnose the issue
          const token = localStorage.getItem("token");
          if (token) debugToken();
          
          // Prevent redirect loop but still redirect to login
          window.location.href = "/auth-test";
          return Promise.reject(error);
        }
        
        // Track login attempts to detect loops
        localStorage.setItem("loginAttempts", (loginAttempts + 1).toString());
        console.log("Login attempts:", loginAttempts + 1);
        
        // Redirect to login page
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

// Interfaces for request payloads
export interface LoginData {
  name: string
  password: string
}

export interface RegisterData {
  name: string
  password: string
  role: string
  district: string // Required for manager and district_manager
}

export interface EmployeeData {
  id?: number
  file_number: string
  full_name: string
  sex: "Male" | "Female"
  employment_date: string
  doe?: string
  individual_pms?: number
  last_dop?: string
  job_grade?: string
  new_salary?: number
  job_category?: string
  new_position?: string
  branch?: string
  department?: string
  district?: string
  twin_branch?: string
  region?: string
  field_of_study?: string
  educational_level?: string
  cluster?: string
  indpms25?: number
  totalexp20?: number
  totalexp?: number
  relatedexp?: number
  expafterpromo?: number
  tmdrec20?: number
  disrec15?: number
  total?: number
}

export interface RecommendationData {
  employee_id: number
  score: number
  tmdrec20?: number // Optional field for API compatibility
}

export interface JobData {
  title: string
  description: string
  qualifications: string
  department: string
  location: string
  job_type: "Internal" | "External"
  deadline: string
  status: "draft" | "active" | "closed" | { 
    String: "draft" | "active" | "closed", 
    Valid: boolean 
  }
}

export interface ApplicationData {
  applicantName: string
  jobId: string
}

export interface ApplicationLinkData {
  type: string
  expiresAt?: string
}

export interface MatchApplicationData {
  employeeId: string
}

export interface NotificationData {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
  employeeId?: number
  employeeName?: string
  recipientRole?: string
}

// Auth API
export const authAPI = {
  login: (name: string, password: string): Promise<AxiosResponse> => {
    return api.post("/api/auth/login", { name, password })
      .then(response => {
        // Store token with Bearer prefix if needed
        if (response.data && response.data.token) {
          const token = response.data.token;
          if (!token.toLowerCase().startsWith('bearer ')) {
            localStorage.setItem('token', `Bearer ${token}`);
            console.log('Token saved with Bearer prefix');
          } else {
            localStorage.setItem('token', token);
            console.log('Token already had Bearer prefix');
          }
          
          // Also store user data
          if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        }
        return response;
      });
  },
  register: (userData: RegisterData): Promise<AxiosResponse> => {
    return api.post("/api/auth/register", userData)
  },
}

// Helper function to get clean token without "Bearer " prefix
function getCleanToken(): string {
  if (typeof window === 'undefined') return '';
  
  const token = localStorage.getItem("token");
  if (!token) return '';
  
  // Remove "Bearer " prefix if present
  if (token.toLowerCase().startsWith('bearer ')) {
    const cleanToken = token.substring(7).trim(); // Remove 'bearer ' (7 characters)
    console.log("Removed 'Bearer ' prefix from token for API call");
    return cleanToken;
  }
  
  return token.trim();
}

// Helper function to ensure token has "Bearer " prefix
function getFormattedToken(): string {
  if (typeof window === 'undefined') return '';
  
  const token = localStorage.getItem("token");
  if (!token) return '';
  
  // Add "Bearer " prefix if not present
  if (!token.toLowerCase().startsWith('bearer ')) {
    return `Bearer ${token.trim()}`;
  }
  
  return token.trim();
}

// Employee API
export const employeeAPI = {
  getAllEmployees: async () => {
    try {
      // Check if token exists before making the request
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found. Please log in again.");
        throw new Error("Authentication required");
      }
      
      // Get formatted token (WITH Bearer prefix)
      const formattedToken = getFormattedToken();
      console.log("Using formatted token for employees API call");
      
      // Add explicit headers for this request
      const response = await api.get("/api/employees/", {
        headers: {
          'Authorization': formattedToken,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Employee API response status:", response.status);
      console.log("Employee API response size:", Array.isArray(response.data) ? response.data.length : 'not an array');
      return response;
    } catch (error: any) {
      console.error("Failed to fetch employees:", error);
      // Log more details if available
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Data:`, error.response.data);
        console.error(`Headers:`, error.response.headers);
      }
      throw error;
    }
  },
  getEmployeeById: (id: string): Promise<AxiosResponse> => {
    return api.get(`/api/employees/${id}`)
  },
  createEmployee: (employeeData: EmployeeData): Promise<AxiosResponse> => {
    return api.post("/api/admin/employees", employeeData)
  },
  updateEmployee: (id: string, employeeData: EmployeeData): Promise<AxiosResponse> => {
    return api.patch(`/api/admin/employees/${id}`, employeeData)
  },
  updateManagerRecommendation: (id: string, data: RecommendationData): Promise<AxiosResponse> => {
    // Create payload that includes both score (for TypeScript interface) and employee_id
    const payload = {
      employee_id: data.employee_id,
      score: data.score,
      // Include tmdrec20 if it exists in the data object
      ...(data.hasOwnProperty('tmdrec20') && { tmdrec20: data.score })
    };
    
    console.log("Sending manager recommendation payload:", payload);
    return api.patch(`/api/manager/employees/${id}/recommendation`, payload);
  },
  getEmployeeEvaluation: (id: string): Promise<AxiosResponse> => {
    return api.get(`/api/manager/employees/${id}/evaluation`)
  },
  getEmployeesForDistrictManager: async () => {
    try {
      console.log("Fetching employees for district manager...");
      
      // Get the district from localStorage for logging
      let district = null;
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            district = user.district || null;
          } catch (e) {
            console.error("Error parsing user data:", e);
          }
        }
        
        if (!district) {
          console.error("District manager missing district assignment");
          throw new Error("No district assigned to district manager");
        }
      }
      
      // Use the new helper function with simply GET method
      const response = await makeDistrictApiCall('/api/district/employees', {
        method: 'GET'
      });
      
      // Process the response
      console.log("District employee response status:", response.status);
      console.log("District employee response size:", Array.isArray(response.data) ? response.data.length : 'not an array');
      
      // Transform the data
      if (response.data && Array.isArray(response.data)) {
        const transformedData = response.data.map(emp => ({
          ...emp,
          full_name: typeof emp.full_name === 'object' ? 
            (emp.full_name?.Valid ? emp.full_name.String : "") : emp.full_name,
          job_grade: typeof emp.job_grade === 'object' ? 
            (emp.job_grade?.Valid ? emp.job_grade.String : "") : emp.job_grade,
          branch: typeof emp.branch === 'object' ? 
            (emp.branch?.Valid ? emp.branch.String : "") : emp.branch,
          district: typeof emp.district === 'object' ? 
            (emp.district?.Valid ? emp.district.String : "") : emp.district,
          current_position: typeof emp.current_position === 'object' ? 
            (emp.current_position?.Valid ? emp.current_position.String : "") : emp.current_position,
          indpms25: typeof emp.indpms25 === 'object' ? 
            (emp.indpms25?.Valid ? emp.indpms25.Float64 : 0) : emp.indpms25,
          totalexp20: typeof emp.totalexp20 === 'object' ? 
            (emp.totalexp20?.Valid ? emp.totalexp20.Float64 : 0) : emp.totalexp20,
          tmdrec20: typeof emp.tmdrec20 === 'object' ? 
            (emp.tmdrec20?.Valid ? emp.tmdrec20.Float64 : 0) : emp.tmdrec20,
          disrec15: typeof emp.disrec15 === 'object' ? 
            (emp.disrec15?.Valid ? emp.disrec15.Float64 : 0) : emp.disrec15,
          total: typeof emp.total === 'object' ? 
            (emp.total?.Valid ? emp.total.Float64 : 0) : emp.total,
        }));
        
        response.data = transformedData;
      }
      
      return response;
    } catch (error) {
      console.error("Failed to fetch employees for district manager:", error);
      throw error;
    }
  },
  getEmployeeForDistrictManager: async (id: string | number) => {
    try {
      console.log("Fetching employee details for district manager, ID:", id);
      
      // Use the new helper function for CORS-safe API calls
      const response = await makeDistrictApiCall(`/api/district/employees/${id}`, {
        method: 'GET'
      });
      
      // Debug log the response
      console.log("Employee detail response status:", response.status);
      
      // Process the data to handle SQL.Null* objects
      if (response.data && typeof response.data === 'object') {
        const emp = response.data;
        const transformedData = {
          ...emp,
          full_name: typeof emp.full_name === 'object' ? 
            (emp.full_name?.Valid ? emp.full_name.String : "") : emp.full_name,
          job_grade: typeof emp.job_grade === 'object' ? 
            (emp.job_grade?.Valid ? emp.job_grade.String : "") : emp.job_grade,
          branch: typeof emp.branch === 'object' ? 
            (emp.branch?.Valid ? emp.branch.String : "") : emp.branch,
          district: typeof emp.district === 'object' ? 
            (emp.district?.Valid ? emp.district.String : "") : emp.district,
          current_position: typeof emp.current_position === 'object' ? 
            (emp.current_position?.Valid ? emp.current_position.String : "") : emp.current_position,
          indpms25: typeof emp.indpms25 === 'object' ? 
            (emp.indpms25?.Valid ? emp.indpms25.Float64 : 0) : emp.indpms25,
          totalexp20: typeof emp.totalexp20 === 'object' ? 
            (emp.totalexp20?.Valid ? emp.totalexp20.Float64 : 0) : emp.totalexp20,
          tmdrec20: typeof emp.tmdrec20 === 'object' ? 
            (emp.tmdrec20?.Valid ? emp.tmdrec20.Float64 : 0) : emp.tmdrec20,
          disrec15: typeof emp.disrec15 === 'object' ? 
            (emp.disrec15?.Valid ? emp.disrec15.Float64 : 0) : emp.disrec15,
          total: typeof emp.total === 'object' ? 
            (emp.total?.Valid ? emp.total.Float64 : 0) : emp.total,
        };
        
        response.data = transformedData;
      }
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch employee ${id} for district manager:`, error);
      throw error;
    }
  },
  updateDistrictManagerRecommendation: async (id: string, data: RecommendationData) => {
    try {
      console.log(`Updating district recommendation for employee ${id} with score ${data.score}`);
      
      // Get district information
      let district = '';
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            district = user.district || '';
            console.log("District manager for district:", district);
          } catch (e) {
            console.error("Error parsing user data:", e);
          }
        }
      }
      
      // Include district in payload
      const payload = {
        ...data,
        district: district
      };
      
      // Use the makeDistrictApiCall helper for CORS-safe API call
      console.log("Making district recommendation update with district:", district);
      
      return await makeDistrictApiCall(`/api/district/employees/${id}/recommendation`, {
        method: 'PATCH',
        data: payload
      });
    } catch (error) {
      console.error(`Failed to update district recommendation for employee ${id}:`, error);
      throw error;
    }
  },
  deleteEmployee: (id: string): Promise<AxiosResponse> => {
    return api.delete(`/api/admin/employees/${id}`)
  },
}

// Job API
export const jobAPI = {
  createJob: (jobData: JobData): Promise<AxiosResponse> => {
    return api.post("/api/admin/jobs/", jobData)
  },
  getAllJobs: (): Promise<AxiosResponse> => {
    return api.get("/api/admin/jobs/")
  },
  getJobById: (id: string): Promise<AxiosResponse> => {
    return api.get(`/api/admin/jobs/${id}`)
  },
  updateJob: (id: string, jobData: JobData): Promise<AxiosResponse> => {
    return api.put(`/api/admin/jobs/${id}`, jobData)
  },
  deleteJob: (id: string): Promise<AxiosResponse> => {
    return api.delete(`/api/admin/jobs/${id}`)
  },
  generateApplicationLinks: (id: string, data: ApplicationLinkData): Promise<AxiosResponse> => {
    return api.post(`/api/admin/jobs/${id}/application-links`, data)
  },
  getApplicationLinks: (id: string): Promise<AxiosResponse> => {
    return api.get(`/api/admin/jobs/${id}/application-links`)
  },
  getApplicationsForJob: (id: string): Promise<AxiosResponse> => {
    return api.get(`/api/admin/jobs/${id}/applications`)
  },
  getAllInternalApplications: (): Promise<AxiosResponse> => {
    return api.get("/api/admin/applications/internal")
  },
  getAllExternalApplications: (): Promise<AxiosResponse> => {
    return api.get("/api/admin/applications/external")
  },
  getInternalApplicationsByJob: (id: string): Promise<AxiosResponse> => {
    return api.get(`/api/admin/applications/internal/${id}`)
  },
  getExternalApplicationsByJob: (id: string): Promise<AxiosResponse> => {
    return api.get(`/api/admin/applications/external/${id}`)
  },
  matchInternalApplicantWithEmployee: (id: string, data: MatchApplicationData): Promise<AxiosResponse> => {
    return api.post(`/api/admin/applications/internal/${id}/match`, data)
  },
  matchApplicationDirectly: (id: string, data: MatchApplicationData): Promise<AxiosResponse> => {
    return api.post(`/api/admin/applications/match/${id}`, data)
  },
}

// User API
export const userAPI = {
  createuser: (userData: RegisterData): Promise<AxiosResponse> => {
    return api.post("/api/auth/register", userData)
  },
  getAllUsers: (): Promise<AxiosResponse> => {
    return api.get("/api/admin/users")
  },
  deleteUser: (id: string): Promise<AxiosResponse> => {
    return api.delete(`/api/admin/users/${id}`)
  },
  updateUser: (id: string, userData: Partial<RegisterData>): Promise<AxiosResponse> => {
    return api.patch(`/api/admin/users/${id}`, userData)
  },
}

// Public API
export const publicAPI = {
  getAllJobs: (): Promise<AxiosResponse> => {
    return axios.get(`${API_BASE_URL}/api/public/jobs`)
  },
  applyInternal: (data: ApplicationData): Promise<AxiosResponse> => {
    return axios.post(`${API_BASE_URL}/api/public/apply/internal`, data)
  },
  applyExternal: (data: ApplicationData): Promise<AxiosResponse> => {
    return axios.post(`${API_BASE_URL}/api/public/apply/external`, data)
  },
  getSecureApplicationForm: (token: string): Promise<AxiosResponse> => {
    return axios.get(`${API_BASE_URL}/api/secure/apply/${token}`)
  },
  submitSecureInternalApplication: (token: string, data: ApplicationData): Promise<AxiosResponse> => {
    return axios.post(`${API_BASE_URL}/api/secure/apply/internal/${token}`, data)
  },
  submitSecureExternalApplication: (token: string, data: ApplicationData): Promise<AxiosResponse> => {
    return axios.post(`${API_BASE_URL}/api/secure/apply/external/${token}`, data)
  },
}

// Notification API - Using localStorage since there's no backend for notifications
export const notificationAPI = {
  getNotifications: (): Promise<AxiosResponse> => {
    return new Promise((resolve) => {
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      resolve({ data: notifications, status: 200 } as AxiosResponse);
    });
  },
  markAsRead: (id: string): Promise<AxiosResponse> => {
    return new Promise((resolve) => {
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updatedNotifications = notifications.map((notification: NotificationData) => {
        if (notification.id === id) {
          return { ...notification, read: true };
        }
        return notification;
      });
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      resolve({ data: { success: true }, status: 200 } as AxiosResponse);
    });
  },
  markAllAsRead: (): Promise<AxiosResponse> => {
    return new Promise((resolve) => {
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updatedNotifications = notifications.map((notification: NotificationData) => {
        return { ...notification, read: true };
      });
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      resolve({ data: { success: true }, status: 200 } as AxiosResponse);
    });
  },
  deleteNotification: (id: string): Promise<AxiosResponse> => {
    return new Promise((resolve) => {
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updatedNotifications = notifications.filter(
        (notification: NotificationData) => notification.id !== id
      );
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      resolve({ data: { success: true }, status: 200 } as AxiosResponse);
    });
  }
}

// Add this new function at the top level, outside any other functions
// Special function to handle district API calls with proper CORS handling
export async function makeDistrictApiCall(endpoint: string, config: any = {}) {
  // Remove trailing slashes from endpoint
  let cleanedEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
  
  // Build the full URL with API base (no trailing slash)
  const url = `${API_BASE_URL}${cleanedEndpoint}`;
  console.log("Making district API call to:", url);
  
  // Get API method, default to GET
  const method = config.method?.toUpperCase() || 'GET';
  console.log("API Method:", method);
  
  // Get formatted token
  const formattedToken = getFormattedToken();
  
  // Get district
  let district = '';
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      district = user.district || '';
      console.log("Using district:", district);
    }
  } catch (e) {
    console.error("Error getting district:", e);
  }

  // For GET requests, use a more direct approach
  if (method === 'GET') {
    console.log(`Making direct GET request to ${url}`);
    
    // Create headers
    const headers = {
      'Authorization': formattedToken,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-District': district,
    };
    
    // Query parameters
    const params = new URLSearchParams();
    if (district) {
      params.append('district', district);
    }
    
    // Build final URL with query parameters
    const finalUrl = `${url}${params.toString() ? '?' + params.toString() : ''}`;
    console.log("Final URL with params:", finalUrl);
    
    try {
      // Use the basic fetch API instead of axios for simplicity
      const response = await fetch(finalUrl, {
        method: 'GET',
        headers: headers,
        credentials: 'include', // Include cookies
      });
      
      console.log("Fetch response status:", response.status);
      
      // Parse response as JSON
      const data = await response.json();
      
      // Return in axios-compatible format
      return {
        status: response.status,
        data: data,
        headers: Object.fromEntries(response.headers.entries()),
        config: {},
        statusText: response.statusText,
      };
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  } else {
    // For non-GET requests, continue with axios
    const finalConfig = {
      ...config,
      url: url,
      method,
      headers: {
        'Authorization': formattedToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-District': district,
        ...config.headers,
      },
      params: {
        ...config.params,
        district: district
      },
      withCredentials: true
    };
    
    console.log(`Making ${method} request with axios`);
    try {
      const response = await axios(finalConfig);
      console.log(`API call succeeded with status: ${response.status}`);
      return response;
    } catch (error: any) {
      console.error(`API call failed with error: ${error.message}`);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Data:`, error.response.data);
      }
      throw error;
    }
  }
}

export default {
  authAPI,
  employeeAPI,
  jobAPI,
  userAPI,
  publicAPI,
  notificationAPI,
}

// Also export the APIs as named exports for direct imports
export {
  authAPI,
  employeeAPI,
  jobAPI,
  userAPI,
  publicAPI,
  notificationAPI,
}
