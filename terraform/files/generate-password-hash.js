/**
 * Password Hash Generator
 * 
 * This script generates a salted password hash suitable for use with
 * the docs authentication Lambda function. The hash can be provided
 * as a Terraform variable.
 * 
 * Usage:
 *   node generate-password-hash.js <password>
 * 
 * Example:
 *   node generate-password-hash.js mysecretpassword
 */

const crypto = require('crypto');

// Get password from command line args
const password = process.argv[2];

if (!password) {
  console.error('Error: Password is required');
  console.error('Usage: node generate-password-hash.js <password>');
  process.exit(1);
}

// Generate random salt
const salt = crypto.randomBytes(16).toString('hex');

// Hash the password with salt using SHA-256
const hash = crypto.createHash('sha256')
  .update(salt + password)
  .digest('hex');

// Format the hash in the format expected by the Lambda: algorithm:salt:hash
const passwordHash = `sha256:${salt}:${hash}`;

console.log('Password Hash:');
console.log(passwordHash);
console.log('\nUse this value for the docs_auth_password_hash variable in terraform.tfvars');