// Direct connection test script
const http = require('http');

// Configure options for direct backend connection
const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/ping',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': 'http://localhost:35069' // Use your frontend port
  }
};

// Send a request directly to the backend
const req = http.request(options, res => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  
  res.on('data', chunk => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('RESPONSE BODY:');
    console.log(data);
    
    if (res.statusCode === 200) {
      console.log('✅ Direct connection successful!');
    } else {
      console.log('❌ Direct connection failed with status code:', res.statusCode);
    }
  });
});

req.on('error', error => {
  console.error('REQUEST ERROR:', error);
  console.log('❌ Direct connection failed. Make sure the backend is running on port 8080.');
});

req.end();

console.log('Sending test request directly to backend...'); 