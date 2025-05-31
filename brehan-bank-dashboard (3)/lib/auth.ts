import { jwtDecode, JwtPayload } from './jwt-utils';

// Define the JWT token structure
interface JwtPayload {
  id: number;
  username: string;
  role: string;
  district?: string;
  exp: number;
}

/**
 * Gets the user's district from JWT token
 * @returns {string | null} The user's district or null if not found
 */
export function getUserDistrict(): string | null {
  try {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // If no token, return null
    if (!token) {
      console.warn('No token found in localStorage');
      return null;
    }
    
    // Decode the token
    const decoded = jwtDecode(token);
    
    // Return the district from the decoded token
    return decoded.district || null;
  } catch (error) {
    console.error('Error getting user district:', error);
    return null;
  }
}

/**
 * Gets the user's role from JWT token
 * @returns {string | null} The user's role or null if not found
 */
export function getUserRole(): string | null {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('No token found in localStorage');
      return null;
    }
    
    const decoded = jwtDecode(token);
    return decoded.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Checks if the user is authenticated
 * @returns {boolean} Whether the user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return false;
  }
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    return decoded.exp ? decoded.exp > currentTime : false;
  } catch {
    return false;
  }
} 