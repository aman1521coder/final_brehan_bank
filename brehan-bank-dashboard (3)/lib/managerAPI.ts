import axios, { type AxiosResponse } from "axios"
import type { RecommendationData } from "./api"

// API base URL - configurable via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include credentials (cookies) with all requests
})

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

// Standalone function to update manager recommendation
export async function updateManagerRecommendation(id: string, data: RecommendationData): Promise<AxiosResponse> {
  // Create payload that includes both score (for TypeScript interface) and employee_id
  const payload = {
    employee_id: data.employee_id,
    score: data.score,
    tmdrec20: data.score // Always include tmdrec20
  };
  
  console.log("Sending manager recommendation payload:", payload);
  
  // Get formatted token (WITH Bearer prefix)
  const formattedToken = getFormattedToken();
  
  // Make the API call with explicit headers
  return api.patch(`/api/manager/employees/${id}/recommendation`, payload, {
    headers: {
      'Authorization': formattedToken,
      'Content-Type': 'application/json'
    }
  });
} 