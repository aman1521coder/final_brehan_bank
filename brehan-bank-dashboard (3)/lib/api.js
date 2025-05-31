// Import axios
import axios from 'axios';

// API base URL - configurable via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include credentials (cookies) with all requests
});

// Debug token function
export function debugToken() {
  if (typeof window === 'undefined') {
    return { raw: "", cleaned: "", hasPrefix: false };
  }
  
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Token is null or undefined");
    return { raw: "", cleaned: "", hasPrefix: false };
  }
  
  try {
    // Log first part of token for debugging
    console.log("Token first 15 chars:", token.substring(0, 15) + "...");
    
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

// Helper function to ensure token has "Bearer " prefix
function getFormattedToken() {
  if (typeof window === 'undefined') return '';
  
  const token = localStorage.getItem("token");
  if (!token) return '';
  
  // Add "Bearer " prefix if not present
  if (!token.toLowerCase().startsWith('bearer ')) {
    return `Bearer ${token.trim()}`;
  }
  
  return token.trim();
}

// Employee API functions
export const employeeAPI = {
  getAllEmployees: async () => {
    try {
      // Check if token exists before making the request
      if (typeof window === 'undefined') {
        return { data: [] };
      }
      
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found. Please log in again.");
        throw new Error("Authentication required");
      }
      
      // Log the token first part for debugging
      console.log("Using token (first 10 chars):", token.substring(0, 10) + "...");
      
      // Format the token - Backend now WANTS the "Bearer " prefix!
      let formattedToken = token;
      if (!token.toLowerCase().startsWith('bearer ')) {
        formattedToken = `Bearer ${token.trim()}`;
        console.log("Added 'Bearer ' prefix to token for API call");
      }
      
      // Add explicit headers for this request - WITH "Bearer " prefix!
      const response = await api.get("/api/employees/", {
        headers: {
          'Authorization': formattedToken,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Employee API response status:", response.status);
      console.log("Employee API response size:", Array.isArray(response.data) ? response.data.length : 'not an array');
      return response;
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      // Log more details if available
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Data:`, error.response.data);
      }
      throw error;
    }
  },
  
  getEmployeeById: (id) => {
    return api.get(`/api/employees/${id}`);
  }
};

// Auth API functions
export const authAPI = {
  login: async (name, password) => {
    try {
      const response = await api.post("/api/auth/login", { name, password });
      
      // Store token directly as returned from backend
      if (response.data && response.data.token) {
        // Make sure token has 'Bearer ' prefix
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
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Job API functions
export const jobAPI = {
  getAllJobs: async () => {
    try {
      const formattedToken = getFormattedToken();
      const headers = formattedToken ? { Authorization: formattedToken } : {};
      
      const response = await api.get("/api/admin/jobs/", { headers });
      return response;
    } catch (error) {
      console.error("Error fetching jobs:", error);
      throw error;
    }
  },
  
  getJobById: async (id) => {
    try {
      const formattedToken = getFormattedToken();
      const headers = formattedToken ? { Authorization: formattedToken } : {};
      
      const response = await api.get(`/api/admin/jobs/${id}`, { headers });
      return response;
    } catch (error) {
      console.error(`Error fetching job ${id}:`, error);
      throw error;
    }
  }
};

// User API functions
export const userAPI = {
  getAllUsers: async () => {
    try {
      const formattedToken = getFormattedToken();
      const headers = formattedToken ? { Authorization: formattedToken } : {};
      
      const response = await api.get("/api/admin/users", { headers });
      return response;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }
};

// Test connection function
export async function testConnection() {
  try {
    // Test connection with ping endpoint
    console.log("Testing API connection to:", `${API_BASE_URL}/ping`);
    const pingResponse = await axios.get(`${API_BASE_URL}/ping`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: true,
      ping: pingResponse.data
    };
  } catch (error) {
    console.error('API connection test failed:', error);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

// Default export
export default {
  authAPI,
  employeeAPI,
  jobAPI,
  userAPI,
  debugToken,
  testConnection
}; 