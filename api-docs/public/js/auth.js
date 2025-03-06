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
      return '/' + pathParts[1];
    }
  }
  
  // Default fallback
  return '';
}

// Load configuration values
async function loadConfig() {
  try {
    const basePath = getBasePath();
    
    // First try the API endpoint (for development)
    try {
      const response = await fetch(`${basePath}/api/config`);
      if (response.ok) {
        const config = await response.json();
        if (config.features && config.features.auth) {
          API_URL = config.features.auth.apiUrl || API_URL;
          TOKEN_KEY = config.features.auth.tokenKey || TOKEN_KEY;
          EXPIRY_KEY = config.features.auth.expiryKey || EXPIRY_KEY;
          return;
        }
      }
    } catch (e) {
      console.log('API endpoint not available, trying static file');
    }
    
    // Fallback to static JSON file (for production/GitHub Pages)
    const staticResponse = await fetch(`${basePath}/api/config.json`);
    if (!staticResponse.ok) {
      throw new Error('Failed to fetch config from static file');
    }
    const config = await staticResponse.json();
    
    // Set auth configuration from config file
    if (config.features && config.features.auth) {
      API_URL = config.features.auth.apiUrl || API_URL;
      TOKEN_KEY = config.features.auth.tokenKey || TOKEN_KEY;
      EXPIRY_KEY = config.features.auth.expiryKey || EXPIRY_KEY;
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
    window.location.href = getBasePath() + '/';
    
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
  window.location.href = getBasePath() + '/login.html';
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
      const response = await fetch(`${basePath}/api/config`);
      if (response.ok) {
        const config = await response.json();
        if (config.features && config.features.auth) {
          return config.features.auth.enabled && 
                 config.features.auth.provider === 'password';
        }
      }
    } catch (e) {
      console.log('API endpoint not available for auth check, trying static file');
    }
    
    // Fallback to static JSON file (for production/GitHub Pages)
    const staticResponse = await fetch(`${basePath}/api/config.json`);
    if (!staticResponse.ok) {
      throw new Error('Failed to fetch config from static file');
    }
    const config = await staticResponse.json();
    return config.features.auth.enabled && 
           config.features.auth.provider === 'password';
  } catch (error) {
    console.error('Error fetching config:', error);
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
      window.location.href = getBasePath() + '/';
    }
  } else {
    // On protected pages, check authentication
    if (!isAuthenticated()) {
      window.location.href = getBasePath() + '/login.html';
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