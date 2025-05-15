// CORS Middleware for development
// This script will proxy requests and add CORS headers

const fetch = window.fetch;

// Override the fetch function to add CORS headers
window.fetch = function(url, options = {}) {
  console.log('Intercepted fetch to:', url);
  
  // Add CORS headers to the request
  const newOptions = {
    ...options,
    mode: 'cors',
    credentials: 'include',
    headers: {
      ...options.headers,
      'Origin': window.location.origin,
      'Accept': 'application/json',
    },
  };
  
  // Make the request
  return fetch(url, newOptions)
    .then(response => {
      console.log('Response status:', response.status);
      return response;
    })
    .catch(error => {
      console.error('Fetch error:', error);
      throw error;
    });
};

console.log('CORS middleware initialized'); 