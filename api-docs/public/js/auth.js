/**
 * Authentication script for API Documentation
 * This script handles password-based authentication for the docs site
 */

// Configuration - replace with your own values
const API_URL = 'https://your-api-gateway-url.execute-api.region.amazonaws.com/stage/auth';
const TOKEN_KEY = 'docs_auth_token';
const EXPIRY_KEY = 'docs_auth_expiry';

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
    
    // Redirect to docs
    window.location.href = '/';
    
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
  window.location.href = '/login.html';
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

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on the login page
  const isLoginPage = window.location.pathname.includes('login.html');
  
  if (isLoginPage) {
    // Initialize login form
    initLoginForm();
    
    // If already authenticated, redirect to docs
    if (isAuthenticated()) {
      window.location.href = '/';
    }
  } else {
    // On protected pages, check authentication
    if (!isAuthenticated()) {
      window.location.href = '/login.html';
    }
    
    // Add logout button functionality
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', logout);
    }
  }
});