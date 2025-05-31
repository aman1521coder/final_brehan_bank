// This file contains district API functions previously in api-client.ts
import { makeDistrictApiCall } from './api';

// District API calls with specific handling for district manager endpoints
export const districtApi = {
  getEmployees: async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    console.log("Fetching employees for district manager...");
    
    // Use makeDistrictApiCall for direct API access
    const response = await makeDistrictApiCall('/api/district/employees', {
      method: 'GET'
    });
    
    console.log(`Loaded ${response.data?.length || 0} district employees`);
    return response.data;
  },
  
  getEmployeeById: async (employeeId: number) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    console.log(`Fetching single employee data for ID: ${employeeId}`);
    
    const response = await makeDistrictApiCall(`/api/district/employees/${employeeId}`, {
      method: 'GET'
    });
    
    return response.data;
  },
  
  updateRecommendation: async (employeeId: number, score: number) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    console.log(`Updating recommendation for employee ${employeeId} with score ${score}`);
    
    const userStr = localStorage.getItem("user");
    let district = '';
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        district = user.district || '';
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
    
    const response = await makeDistrictApiCall(`/api/district/employees/${employeeId}/recommendation`, {
      method: 'PATCH',
      data: {
        employee_id: employeeId,
        score: score,
        district: district
      }
    });
    
    return response.data;
  },
  
  getEmployeeEvaluation: async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');
      
      const response = await makeDistrictApiCall(`/api/district/employees/${id}/evaluation`, {
        method: 'GET'
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching evaluation for employee ${id}:`, error);
      throw error;
    }
  },
  
  // Add a function to get all employees (unfiltered) for debugging
  getAllEmployees: async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    console.log("Fetching ALL employees for debugging...");
    
    const response = await makeDistrictApiCall('/api/employees', {
      method: 'GET'
    });
    
    console.log(`Loaded ${response.data?.length || 0} total employees`);
    return response.data;
  },
};

export default districtApi; 