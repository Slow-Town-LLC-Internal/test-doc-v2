/**
 * Authentication script for API Documentation
 * This script handles password-based authentication for the docs site
 */

// Prevent multiple script execution
if (window.docsAuthInitialized) {
  // Script already loaded and initialized, exit early
  console.log('Auth script already initialized, skipping.');
} else {
  window.docsAuthInitialized = true;

// Configuration will be loaded from app config
let API_URL = '';
let TOKEN_KEY = 'docs_auth_token';
let EXPIRY_KEY = 'docs_auth_expiry';

// Get the base path for GitHub Pages
function getBasePath() {
  // If window.basePath is defined by our helper script, use that
  if (typeof window.basePath !== 'undefined') {
    return window.basePath;
  }
  
  // Try to detect repository name from URL path
  if (window.location.hostname.includes('github.io')) {
    // Extract repository name from path
    const pathParts = window.location.pathname.split('/');
    // The first part after the hostname should be the repo name
    if (pathParts.length > 1 && pathParts[1]) {
      console.log('Detected GitHub Pages repo path:', '/' + pathParts[1]);
      return '/' + pathParts[1];
    }
  }
  
  // Default fallback for local development
  console.log('Using default empty base path (local development)');
  return '';
}

// Load configuration values
async function loadConfig() {
  try {
    const basePath = getBasePath();
    console.log('Using base path for config:', basePath);
    
    // First try the API endpoint (for development)
    try {
      const apiConfigUrl = `${window.location.origin}${basePath}/api/config`;
      console.log('Trying to load config from API endpoint:', apiConfigUrl);
      const response = await fetch(apiConfigUrl);
      if (response.ok) {
        const config = await response.json();
        if (config.features && config.features.auth) {
          console.log('Loaded config from API endpoint');
          API_URL = config.features.auth.apiUrl || API_URL;
          TOKEN_KEY = config.features.auth.tokenKey || TOKEN_KEY;
          EXPIRY_KEY = config.features.auth.expiryKey || EXPIRY_KEY;
          console.log('API URL set to:', API_URL);
          return;
        }
      } else {
        console.log('API endpoint returned error status:', response.status);
      }
    } catch (e) {
      console.log('API endpoint not available, trying static file:', e);
    }
    
    // Fallback to static JSON file (for production/GitHub Pages)
    const staticConfigUrl = `${window.location.origin}${basePath}/api/config.json`;
    console.log('Trying to load config from static file:', staticConfigUrl);
    const staticResponse = await fetch(staticConfigUrl, {
      cache: 'no-store', // Prevent caching to ensure fresh config
      headers: {
        'pragma': 'no-cache',
        'cache-control': 'no-cache'
      }
    });
    
    if (!staticResponse.ok) {
      console.error(`Failed to fetch config from static file: ${staticResponse.status} ${staticResponse.statusText}`);
      // Try alternative path as last resort (direct from public folder)
      const altConfigUrl = `${window.location.origin}${basePath}/api-config.json`;
      console.log('Trying alternative config path:', altConfigUrl);
      const altResponse = await fetch(altConfigUrl);
      if (!altResponse.ok) {
        throw new Error(`Failed to fetch config from all paths - static: ${staticResponse.status}, alt: ${altResponse.status}`);
      }
      const config = await altResponse.json();
      console.log('Loaded config from alternative path');
      
      // Set auth configuration from config file
      if (config.features && config.features.auth) {
        API_URL = config.features.auth.apiUrl || API_URL;
        TOKEN_KEY = config.features.auth.tokenKey || TOKEN_KEY;
        EXPIRY_KEY = config.features.auth.expiryKey || EXPIRY_KEY;
        console.log('API URL set to:', API_URL);
      }
      return;
    }
    
    const config = await staticResponse.json();
    console.log('Loaded config from static file');
    
    // Set auth configuration from config file
    if (config.features && config.features.auth) {
      API_URL = config.features.auth.apiUrl || API_URL;
      TOKEN_KEY = config.features.auth.tokenKey || TOKEN_KEY;
      EXPIRY_KEY = config.features.auth.expiryKey || EXPIRY_KEY;
      console.log('API URL set to:', API_URL);
    }
  } catch (error) {
    console.error('Error loading auth configuration:', error);
  }
}

// Check if the user is authenticated
function isAuthenticated() {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem(EXPIRY_KEY);
  
  if (!token || !expiry) {
    return false;
  }
  
  // Check if token has expired
  const now = Math.floor(Date.now() / 1000);
  if (now > parseInt(expiry, 10)) {
    // Token expired, clear storage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    return false;
  }
  
  return true;
}

// Authenticate with password
async function authenticate(password) {
  try {
    // Show loading state
    const submitButton = document.getElementById('login-button');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Authenticating...';
    }
    
    // Call authentication API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password })
    });
    
    // Parse response
    const data = await response.json();
    
    // Reset button state
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Sign In';
    }
    
    // Handle error
    if (!response.ok) {
      throw new Error(data.error || 'Authentication failed');
    }
    
    // Store token and expiry
    const token = data.token;
    const expiryTime = Math.floor(Date.now() / 1000) + data.expiresIn;
    
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EXPIRY_KEY, expiryTime.toString());
    
    // Redirect to docs with correct base path
    const basePath = getBasePath();
    console.log('Login successful, redirecting with base path:', basePath);
    window.location.href = `${window.location.origin}${basePath}/`;
    
    return true;
  } catch (error) {
    console.error('Authentication error:', error);
    
    // Show error message
    const errorElement = document.getElementById('login-error');
    if (errorElement) {
      errorElement.textContent = error.message || 'Authentication failed. Please try again.';
      errorElement.style.display = 'block';
    }
    
    return false;
  }
}

// Logout function
function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRY_KEY);
  
  // Get the correct base path
  const basePath = getBasePath();
  console.log('Logging out, redirecting with base path:', basePath);
  
  // Redirect to login page with correct path
  window.location.href = `${window.location.origin}${basePath}/login.html`;
}

// Initialize login form
function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;
  
  form.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const passwordInput = document.getElementById('password');
    if (!passwordInput) return;
    
    const password = passwordInput.value.trim();
    if (!password) {
      const errorElement = document.getElementById('login-error');
      if (errorElement) {
        errorElement.textContent = 'Password is required';
        errorElement.style.display = 'block';
      }
      return;
    }
    
    authenticate(password);
  });
}

// Check if auth is enabled in the config
async function isAuthEnabled() {
  try {
    const basePath = getBasePath();
    
    // First try the API endpoint (for development)
    try {
      const apiConfigUrl = `${window.location.origin}${basePath}/api/config`;
      console.log('Checking auth enabled from API endpoint:', apiConfigUrl);
      const response = await fetch(apiConfigUrl);
      if (response.ok) {
        const config = await response.json();
        if (config.features && config.features.auth) {
          const authEnabled = config.features.auth.enabled && 
                 config.features.auth.provider === 'password';
          console.log('Auth enabled from API endpoint:', authEnabled);
          return authEnabled;
        }
      } else {
        console.log('API endpoint returned error status:', response.status);
      }
    } catch (e) {
      console.log('API endpoint not available for auth check, trying static file');
    }
    
    // Fallback to static JSON file (for production/GitHub Pages)
    const staticConfigUrl = `${window.location.origin}${basePath}/api/config.json`;
    console.log('Checking auth enabled from static file:', staticConfigUrl);
    const staticResponse = await fetch(staticConfigUrl, {
      cache: 'no-store', // Prevent caching to ensure fresh config
      headers: {
        'pragma': 'no-cache',
        'cache-control': 'no-cache'
      }
    });
    
    if (!staticResponse.ok) {
      console.error(`Failed to fetch config from static file: ${staticResponse.status} ${staticResponse.statusText}`);
      
      // Try alternative path as last resort (direct from public folder)
      const altConfigUrl = `${window.location.origin}${basePath}/api-config.json`;
      console.log('Trying alternative config path for auth check:', altConfigUrl);
      try {
        const altResponse = await fetch(altConfigUrl);
        if (altResponse.ok) {
          const config = await altResponse.json();
          const authEnabled = config.features?.auth?.enabled && 
                config.features?.auth?.provider === 'password';
          console.log('Auth enabled from alternative config:', authEnabled);
          return authEnabled;
        } else {
          console.error('Alternative config file returned error:', altResponse.status);
        }
      } catch (e) {
        console.error('Error fetching alternative config:', e);
      }
      
      console.warn('Failed to load config from all paths, defaulting to auth disabled');
      return false;
    }
    
    const config = await staticResponse.json();
    const authEnabled = config.features?.auth?.enabled && 
           config.features?.auth?.provider === 'password';
    console.log('Auth enabled from static file:', authEnabled);
    return authEnabled;
  } catch (error) {
    console.error('Error checking if auth is enabled:', error);
    return false; // Default to not requiring auth if config can't be loaded
  }
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', async function() {
  // First load configuration
  await loadConfig();
  
  // Then check if auth is enabled at all
  const authEnabled = await isAuthEnabled();
  
  // If auth is disabled, don't do any redirects
  if (!authEnabled) {
    return;
  }
  
  // Check if we're on the login page
  const isLoginPage = window.location.pathname.includes('login.html');
  
  if (isLoginPage) {
    // Initialize login form
    initLoginForm();
    
    // If already authenticated, redirect to docs
    if (isAuthenticated()) {
      const basePath = getBasePath();
      console.log('Already authenticated, redirecting to docs with base path:', basePath);
      window.location.href = `${window.location.origin}${basePath}/`;
    }
  } else {
    // On protected pages, check authentication
    if (!isAuthenticated()) {
      const basePath = getBasePath();
      console.log('Not authenticated, redirecting to login with base path:', basePath);
      window.location.href = `${window.location.origin}${basePath}/login.html`;
    }
    
    // Add logout button functionality
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', logout);
    }
  }
});

// Close the "if (window.docsAuthInitialized)" block
}