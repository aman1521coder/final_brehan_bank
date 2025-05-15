// Test connection script
const http = require('http');

// Configure the request to our proxy
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/ping',
  method: 'GET'
};

// Send a request to test connectivity
const req = http.request(options, res => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  
  // A chunk of data has been received
  res.on('data', chunk => {
    data += chunk;
  });
  
  // The whole response has been received
  res.on('end', () => {
    console.log('RESPONSE BODY:');
    console.log(data);
    
    if (res.statusCode === 200) {
      console.log('✅ Connection successful!');
    } else {
      console.log('❌ Connection failed with status code:', res.statusCode);
    }
  });
});

// Handle request errors
req.on('error', error => {
  console.error('REQUEST ERROR:', error);
  console.log('❌ Connection failed. Make sure the proxy server is running.');
});

// Send the request
req.end();

console.log('Sending test request to proxy server...'); 