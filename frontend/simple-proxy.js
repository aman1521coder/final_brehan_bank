// Simple proxy server using only Node.js built-in modules
const http = require('http');
const url = require('url');

// Configuration
const PORT = 3001;
const TARGET_HOST = 'localhost';
const TARGET_PORT = 8080;

// Create server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  console.log(`Proxying: ${req.method} ${req.url}`);
  
  // Parse the request URL
  const parsedUrl = url.parse(req.url);
  
  // Options for the proxy request
  const options = {
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    path: parsedUrl.path,
    method: req.method,
    headers: {
      ...req.headers,
      host: TARGET_HOST + ':' + TARGET_PORT
    }
  };
  
  // Create proxy request
  const proxyReq = http.request(options, (proxyRes) => {
    // Add CORS headers to the proxy response
    proxyRes.headers['access-control-allow-origin'] = '*';
    
    // Forward the status and headers
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    
    // Pipe the proxy response to the original response
    proxyRes.pipe(res);
  });
  
  // Handle proxy errors
  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });
    res.end('Proxy error: ' + err.message);
  });
  
  // Pipe the original request to the proxy request
  req.pipe(proxyReq);
});

// Start server
server.listen(PORT, () => {
  console.log(`Simple CORS proxy running on http://localhost:${PORT}`);
  console.log(`Proxying requests to http://${TARGET_HOST}:${TARGET_PORT}`);
}); 