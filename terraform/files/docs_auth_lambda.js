/**
 * Documentation Site Authentication Lambda
 * 
 * This Lambda function provides authentication for the API documentation site.
 * It verifies a password against a stored hash and issues JWT tokens for
 * authenticated users.
 */

// Import crypto for password validation
const crypto = require('crypto');

// JWT signing function
const generateToken = (payload) => {
  // Get the JWT secret from environment variables
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  // Header
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  // Add issued at and expiration time to payload
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + (7 * 24 * 60 * 60) // 7 days
  };

  // Encode header and payload
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  // Create signature
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  // Return complete JWT
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

// Verify password function
const verifyPassword = (password) => {
  // Get stored password hash from environment variables
  const storedHash = process.env.PASSWORD_HASH;
  if (!storedHash) {
    throw new Error('PASSWORD_HASH environment variable is not set');
  }

  // The stored hash should be in the format: algorithm:salt:hash
  const [algorithm, salt, hash] = storedHash.split(':');

  // Hash the provided password with the same salt
  const providedHash = crypto
    .createHash(algorithm)
    .update(salt + password)
    .digest('hex');

  // Compare the hashes (constant-time comparison to prevent timing attacks)
  return crypto.timingSafeEqual(
    Buffer.from(hash, 'hex'),
    Buffer.from(providedHash, 'hex')
  );
};

// Handler function for Lambda
exports.handler = async (event) => {
  // Set up CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*', 
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'OPTIONS,POST',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'OK' })
    };
  }

  try {
    // Parse the request body
    const body = JSON.parse(event.body || '{}');
    const { password } = body;

    // Validate password parameter
    if (!password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Password parameter is required' })
      };
    }

    // Verify the password
    if (!verifyPassword(password)) {
      // Add delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid password' })
      };
    }

    // Generate token for authenticated user
    const token = generateToken({
      // Include minimal payload data - just enough to identify that they're authenticated
      sub: 'docs-user',
      role: 'viewer',
      env: process.env.ENVIRONMENT
    });

    // Return the token to the client
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Authentication successful',
        token,
        expiresIn: 604800 // 7 days in seconds
      })
    };
  } catch (error) {
    console.error('Authentication error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};