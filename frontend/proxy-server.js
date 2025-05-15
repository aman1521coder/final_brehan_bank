// Simple CORS proxy server for Node.js v12
const express = require('express');
const cors = require('cors');
const httpProxy = require('http-proxy');

const app = express();
const PORT = 3001;
const TARGET = 'http://localhost:8080';

// Create a proxy server
const proxy = httpProxy.createServer({});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  res.end('Proxy error: ' + err.message);
});

// Add CORS headers
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin']
}));

// Handle OPTIONS requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin');
  res.sendStatus(204);
});

// Forward all other requests to the target server
app.all('*', (req, res) => {
  console.log(`Proxying request to: ${TARGET}${req.url}`);
  proxy.web(req, res, { 
    target: TARGET,
    changeOrigin: true
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`CORS Proxy server running on http://localhost:${PORT}`);
  console.log(`Proxying requests to ${TARGET}`);
}); 