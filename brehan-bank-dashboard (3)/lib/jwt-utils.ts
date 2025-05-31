// Simple JWT decoder utility to replace jwt-decode dependency

// Define the JWT token structure
export interface JwtPayload {
  id?: string;
  name?: string;
  username?: string;
  district?: string;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: any; // Allow for any other properties
}

/**
 * Decodes a JWT token without any external dependencies
 * @param token The JWT token to decode
 * @returns The decoded token payload or null if invalid
 */
export function jwtDecode(token: string): JwtPayload {
  try {
    // Get the payload part (second part) of the token
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn("Invalid JWT token format (should have 3 parts)");
      return {};
    }
    
    // Decode the base64 encoded payload
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Decode the payload
    const rawPayload = atob(base64);
    
    // Handle Unicode characters
    const output = rawPayload.split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join('');
    
    // Parse and return the payload
    return JSON.parse(decodeURIComponent(output)) || {};
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return {};
  }
}

/**
 * Gets the user's district from their JWT token or localStorage
 * @returns The user's district or null if not found
 */
export function getUserDistrictFromToken(): string | null {
  try {
    if (typeof window === 'undefined') return null;
    
    // Try to get the token
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    // Decode the token
    const decoded = jwtDecode(token);
    
    // Return the district if present
    return decoded.district || null;
  } catch (error) {
    console.error("Error getting district from token:", error);
    return null;
  }
}

export default { jwtDecode, getUserDistrictFromToken }; 