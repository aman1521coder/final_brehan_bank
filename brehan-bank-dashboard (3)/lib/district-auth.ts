import { jwtDecode } from './jwt-utils';

/**
 * Gets the user's district from multiple sources (localStorage, user object, JWT)
 * @returns {string | null} The user's district or null if not found
 */
export function getDistrictFromAllSources(): string | null {
  try {
    if (typeof window === 'undefined') return null;
    
    // First check if we have district directly in localStorage (preferred)
    const districtFromStorage = localStorage.getItem('district');
    if (districtFromStorage) {
      console.log("Found district in localStorage:", districtFromStorage);
      return districtFromStorage;
    }
    
    // Second, check user object in localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.district) {
          console.log("Found district in user object:", user.district);
          return user.district;
        }
      } catch (e) {
        console.warn("Error parsing user JSON:", e);
      }
    }
    
    // Finally, try to get from token
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found in localStorage');
      return null;
    }
    
    // Clean token if it has Bearer prefix
    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
    
    // Decode the token
    const decoded = jwtDecode(cleanToken);
    if (decoded.district) {
      console.log("Found district in JWT token:", decoded.district);
      return decoded.district;
    }
    
    console.warn("No district found in any source");
    return null;
  } catch (error) {
    console.error('Error getting user district:', error);
    return null;
  }
}

/**
 * Debug function to check all sources of district information
 * @returns {Object} Object containing district information from all sources
 */
export function debugDistrictInfo(): any {
  const info: any = {
    localStorage: null,
    userObject: null,
    jwtToken: null
  };
  
  try {
    // Check localStorage
    info.localStorage = localStorage.getItem('district') || null;
    
    // Check user object
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      info.userObject = user.district || null;
    }
    
    // Check JWT token
    const token = localStorage.getItem('token');
    if (token) {
      const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
      const decoded = jwtDecode(cleanToken);
      info.jwtToken = decoded.district || null;
    }
    
    return info;
  } catch (error) {
    console.error('Error in debugDistrictInfo:', error);
    return info;
  }
} 