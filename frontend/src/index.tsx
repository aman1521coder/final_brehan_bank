// Polyfills for older browsers
import 'whatwg-fetch';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles/main.css';

console.log('Application starting...');

// Clear localStorage for a clean state during development
console.log('Development mode: Clearing localStorage for a clean state');
localStorage.clear();

const container = document.getElementById('root');
if (!container) {
  console.error('Could not find root element!');
} else {
  console.log('Root element found, mounting React app...');
  
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    container
  );
  console.log('React app mounted');
} 