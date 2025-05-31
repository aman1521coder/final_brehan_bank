// Re-export functions needed for district components
import axios from 'axios';
import type { NotificationData } from './api';

// API base URL - configurable via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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

// Notification API functions
export const notificationAPI = {
  getNotifications: () => {
    return new Promise((resolve) => {
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      resolve({ data: notifications, status: 200 });
    });
  },
  markAsRead: (id: string) => {
    return new Promise((resolve) => {
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updatedNotifications = notifications.map((notification: any) => {
        if (notification.id === id) {
          return { ...notification, read: true };
        }
        return notification;
      });
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      resolve({ data: { success: true }, status: 200 });
    });
  },
  markAllAsRead: () => {
    return new Promise((resolve) => {
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updatedNotifications = notifications.map((notification: any) => {
        return { ...notification, read: true };
      });
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      resolve({ data: { success: true }, status: 200 });
    });
  }
};

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
    // Try from localStorage directly first
    district = localStorage.getItem('district') || '';
    
    // If not found, try from user object
    if (!district) {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        district = user.district || '';
      }
    }
    console.log("Using district:", district);
  } catch (e) {
    console.error("Error getting district:", e);
  }

  // For GET requests, use a more direct approach with fetch
  if (method === 'GET') {
    console.log(`Making direct GET request to ${url}`);
    
    // Create headers
    const headers: any = {
      'Authorization': formattedToken,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    // Add district header if available
    if (district) {
      headers['X-District'] = district;
      console.log("Added X-District header:", district);
    }
    
    // Query parameters
    const params = new URLSearchParams();
    if (district) {
      params.append('district', district);
    }
    
    // Build final URL with query parameters
    const finalUrl = `${url}${params.toString() ? '?' + params.toString() : ''}`;
    console.log("Final URL with params:", finalUrl);
    
    try {
      // Use the basic fetch API 
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
    // For non-GET requests, use axios
    const finalConfig = {
      ...config,
      url: url,
      method,
      headers: {
        'Authorization': formattedToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(district && { 'X-District': district }),
        ...config.headers,
      },
      params: {
        ...config.params,
        ...(district && { district })
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

// Export interfaces for notification API
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  employeeId?: number | string;
  employeeName?: string;
  recipientRole?: string;
} 