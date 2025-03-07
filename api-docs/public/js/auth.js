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

// Configuration variables
let deploymentConfig = null;
let currentEnvironment = null;

// Get deployment info from config
function getDeploymentInfo() {
  if (deploymentConfig) {
    return deploymentConfig;
  }
  
  // Default values
  return {
    baseUrl: window.location.origin,
    basePath: ''
  };
}

// Determine the current environment based on config or hostname
function detectEnvironment(hostname, config) {
  // First check if there's an explicit environment setting in the config
  if (config && config.deployment && config.deployment.currentEnvironment) {
    const configuredEnv = config.deployment.currentEnvironment;
    console.log('Using explicitly configured environment:', configuredEnv);
    return configuredEnv;
  }
  
  // Otherwise detect based on hostname
  // Check if hostname includes 'localhost' or is an IP address
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.match(/^192\.168\./)) {
    return 'development';
  }
  
  // Check if it's the staging environment
  if (hostname === 'slow-town-llc-internal.github.io') {
    return 'staging';
  }
  
  // Check if it's the production environment
  if (hostname === 'laughing-adventure-w6ko5ze.pages.github.io') {
    return 'production';
  }
  
  // For other environments, auto-detect based on URL
  console.log('Unknown environment, using auto-detection');
  if (hostname.includes('github.io')) {
    return 'github-pages';
  }
  
  return 'unknown';
}

// Get the base path from configuration or auto-detect
function getBasePath() {
  // If we have deployment configuration, use it
  if (deploymentConfig) {
    console.log('Using configured base path:', deploymentConfig.basePath);
    return deploymentConfig.basePath;
  }
  
  // Fallback to auto-detection
  console.log('No deployment config, falling back to auto-detection');
  
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
      console.log('Auto-detected GitHub Pages repo path:', '/' + pathParts[1]);
      return '/' + pathParts[1];
    }
  }
  
  // Default fallback for local development
  console.log('Using default empty base path');
  return '';
}

// Load configuration values
async function loadConfig() {
  try {
    // We'll set the environment later once we have the config loaded
    const hostname = window.location.hostname;
    console.log('Current hostname:', hostname);
    
    // Get initial base path for config loading
    const initialBasePath = getBasePath();
    console.log('Initial base path for config loading:', initialBasePath);
    
    let config = null;
    
    // First try the API endpoint (for development)
    try {
      const apiConfigUrl = `${window.location.origin}${initialBasePath}/api/config`;
      console.log('Trying to load config from API endpoint:', apiConfigUrl);
      const response = await fetch(apiConfigUrl);
      if (response.ok) {
        config = await response.json();
        console.log('Loaded config from API endpoint');
      } else {
        console.log('API endpoint returned error status:', response.status);
      }
    } catch (e) {
      console.log('API endpoint not available, trying static file:', e);
    }
    
    // If API endpoint didn't work, try static JSON file
    if (!config) {
      const staticConfigUrl = `${window.location.origin}${initialBasePath}/api/config.json`;
      console.log('Trying to load config from static file:', staticConfigUrl);
      try {
        const staticResponse = await fetch(staticConfigUrl, {
          cache: 'no-store',
          headers: {
            'pragma': 'no-cache',
            'cache-control': 'no-cache'
          }
        });
        
        if (staticResponse.ok) {
          config = await staticResponse.json();
          console.log('Loaded config from static file');
        } else {
          console.error(`Failed to fetch config from static file: ${staticResponse.status}`);
          
          // Try alternative path as last resort
          const altConfigUrl = `${window.location.origin}${initialBasePath}/api-config.json`;
          console.log('Trying alternative config path:', altConfigUrl);
          const altResponse = await fetch(altConfigUrl);
          if (altResponse.ok) {
            config = await altResponse.json();
            console.log('Loaded config from alternative path');
          } else {
            console.error('All config loading attempts failed');
          }
        }
      } catch (error) {
        console.error('Error fetching config:', error);
      }
    }
    
    // Process config if successful
    if (config) {
      // Set authentication configuration
      if (config.features && config.features.auth) {
        API_URL = config.features.auth.apiUrl || API_URL;
        TOKEN_KEY = config.features.auth.tokenKey || TOKEN_KEY;
        EXPIRY_KEY = config.features.auth.expiryKey || EXPIRY_KEY;
        console.log('API URL set to:', API_URL);
      }
      
      // Determine the environment based on config and hostname
      currentEnvironment = detectEnvironment(window.location.hostname, config);
      console.log('Determined environment:', currentEnvironment);
      
      // Set deployment configuration if available
      if (config.deployment && config.deployment.environments) {
        console.log('Found deployment configuration in config');
        
        // Get environment-specific config
        if (config.deployment.environments[currentEnvironment]) {
          deploymentConfig = config.deployment.environments[currentEnvironment];
          console.log('Using deployment config for environment:', currentEnvironment, deploymentConfig);
        } 
        // For unknown environments with github.io hostname, try github-pages fallback
        else if (currentEnvironment === 'github-pages' && config.deployment.environments['github-pages']) {
          deploymentConfig = config.deployment.environments['github-pages'];
          console.log('Using github-pages fallback deployment config');
        }
        // For unknown environments that match a known hostname pattern
        else if (window.location.hostname.includes('github.io')) {
          console.log('No matching environment config, auto-detecting for GitHub Pages');
          const pathParts = window.location.pathname.split('/');
          if (pathParts.length > 1 && pathParts[1]) {
            deploymentConfig = {
              baseUrl: window.location.origin,
              basePath: '/' + pathParts[1]
            };
            console.log('Auto-detected deployment config:', deploymentConfig);
          }
        } else {
          console.warn(`No environment config found for '${currentEnvironment}', using defaults`);
          // Create a default config based on the current URL
          deploymentConfig = {
            baseUrl: window.location.origin,
            basePath: ''
          };
        }
      }
    }
  } catch (error) {
    console.error('Error loading configuration:', error);
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
    
    // Redirect to docs with correct URL from configuration
    console.log('Login successful, redirecting to home');
    window.location.href = getConfiguredUrl('/');
    
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

// Generate a fully-qualified URL using the deployment configuration
function getConfiguredUrl(path) {
  const deployInfo = getDeploymentInfo();
  const baseUrl = deployInfo.baseUrl || window.location.origin;
  const basePath = deployInfo.basePath || '';
  
  // Ensure path starts with / if it doesn't already
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Combine without double slashes
  let fullUrl = `${baseUrl}${basePath}`;
  if (fullUrl.endsWith('/') && normalizedPath.startsWith('/')) {
    fullUrl += normalizedPath.substring(1);
  } else {
    fullUrl += normalizedPath;
  }
  
  console.log('Generated configured URL:', fullUrl);
  return fullUrl;
}

// Logout function
function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRY_KEY);
  
  console.log('Logging out, using environment:', currentEnvironment);
  
  // Use configured URL for logout redirection
  const loginUrl = getConfiguredUrl('/login.html');
  console.log('Redirecting to login URL:', loginUrl);
  window.location.href = loginUrl;
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
      console.log('Already authenticated, redirecting to home');
      window.location.href = getConfiguredUrl('/');
    }
  } else {
    // On protected pages, check authentication
    if (!isAuthenticated()) {
      console.log('Not authenticated, redirecting to login');
      window.location.href = getConfiguredUrl('/login.html');
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