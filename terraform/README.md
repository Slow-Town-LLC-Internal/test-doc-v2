# API Documentation Authentication Infrastructure

This directory contains Terraform configuration for deploying a simple, secure authentication system for the API documentation site. It uses AWS Lambda and API Gateway to provide password-based authentication that works with GitHub Pages.

## Architecture

The authentication system consists of:

1. **AWS Lambda** - Securely validates passwords and issues JWT tokens
2. **API Gateway** - Provides HTTP endpoint for the authentication Lambda
3. **Client-side JavaScript** - Handles authentication flow in the browser

## Setup Instructions

### Prerequisites

- AWS account with appropriate permissions
- Terraform installed locally
- Node.js installed locally (for generating password hashes)

### Deployment Steps

1. **Generate JWT Secret**

   ```bash
   openssl rand -base64 32
   ```

   Use this value for `docs_auth_jwt_secret` in your tfvars file.

2. **Generate Password Hash**

   ```bash
   node files/generate-password-hash.js yourpassword
   ```

   Use the generated hash for `docs_auth_password_hash` in your tfvars file.

3. **Configure Terraform Variables**

   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

   Edit the `terraform.tfvars` file with your values.

4. **Deploy the Infrastructure**

   ```bash
   terraform init
   terraform plan
   terraform apply
   ```

5. **Update Client Configuration**

   After deployment, Terraform will output the API URL. Update the `API_URL` value in `/api-docs/public/js/auth.js` with this URL.

### Rotating Passwords

To change the password:

1. Generate a new password hash using the script
2. Update the `docs_auth_password_hash` in your tfvars file
3. Run `terraform apply` to update the Lambda

## Security Considerations

- The Lambda stores the password hash and JWT secret as environment variables
- Authentication happens server-side, keeping secrets secure
- API Gateway supports CORS for use with GitHub Pages
- JWT tokens expire after 7 days by default

## Customization

- To change token expiration, modify the Lambda code
- To add multiple passwords, modify the Lambda code to support a list of hashes
- For rate limiting, consider adding API Gateway usage plans