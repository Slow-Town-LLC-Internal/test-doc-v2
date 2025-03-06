# API Documentation Implementation Roadmap

This document outlines the implementation plan and technical details for our API documentation platform.

## Technical Architecture

Our API documentation platform follows a phased implementation approach, with a clear separation of frontend rendering and backend data collection processes.

### Core Technologies

- **TypeScript** - Main implementation language
- **Next.js** - React framework for the documentation site
- **Stoplight Elements** - Interactive API reference components
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Next-themes** - Dark/light mode implementation
- **GitHub OAuth** - Authentication mechanism
- **GitHub Actions** - Automated workflow for spec collection
- **Golang** (optional) - Supporting features for performance-critical operations

## Features & Implementation Plan

### Phase 1: Core Documentation Platform ✅
- Interactive API reference using Stoplight Elements
- Set up Next.js project with TypeScript
- Implement responsive layout with Tailwind CSS
- Add light/dark mode support via next-themes
- Configure sample API specs for initial testing

### Phase 2: Authentication Layer ✅
- Simple password-based authentication with AWS Lambda
- JWT token-based session management
- Protected routes with client-side validation
- Custom login page
- On/off toggle for authentication

### Phase 3: Automated Spec Collection ✅
- Local spec collection tools implemented with Go
- Automatic spec validation and processing
- TypeScript wrapper for Go implementation
- Configurable sources with repository paths and generator commands
- Support for multiple API types (TypeScript, Kotlin)

### Phase 4: CI/CD Integration (Planned)
- GitHub Actions workflow to run spec collection (currently disabled for testing)
- Automated repository scanning and checkout
- Support for both manual triggering and schedule-based execution
- Rebuild and deployment pipeline
- Access management for private repositories

## Project Roadmap & Implementation Status

This project follows a phased approach to implementation, with clear separation of concerns and modular architecture.

### Phase 1: Core Platform ✅
- Next.js project with TypeScript and Tailwind CSS
- Stoplight Elements integration for API documentation
- Light/dark mode toggle with theme persistence
- Responsive design for mobile and desktop
- Sample API specification (Platform API)
- Configuration system for managing API sources

### Phase 2: Authentication ✅
- Simple password-based authentication
- AWS Lambda for secure password validation
- JWT token-based session management
- Client-side auth token validation
- Custom login page with error handling
- Logout functionality in header

### Phase 3: Automated Spec Collection ✅
- Local spec collection tools implemented with Go
- Automatic API spec validation and processing
- TypeScript wrapper for Go implementation
- Configurable sources with repository paths and generator commands
- Support for multiple API types (TypeScript, Kotlin)

### Phase 4: CI/CD Integration (Planned)
- GitHub Actions workflow to run spec collection (currently disabled for testing)
- Automated repository scanning and checkout
- Support for both manual triggering and schedule-based execution
- Rebuild and deployment pipeline
- Access management for private repositories

## Key Design Considerations

### Authentication Security
- **Server-side validation**: Password verification occurs on AWS Lambda, not in client-side code
- **Secure token storage**: JWT tokens are stored in localStorage with expiration
- **Cryptographic practices**: HMAC-SHA256 for JWT signing, salted SHA-256 for password hashing
- **CORS configuration**: API Gateway configured for secure cross-origin requests
- **Environment isolation**: Secrets stored as Lambda environment variables, not in source code

### Architecture Decisions
- **Static site compatibility**: All features designed to work with GitHub Pages (static hosting)
- **API-driven authentication**: Authentication handled by external API, not server-side sessions
- **Client-side protection**: Routes protected by client-side validation to work with static hosting
- **Configurable features**: Authentication can be toggled on/off in configuration
- **Separation of concerns**: Authentication separated from core documentation functionality

### Performance Considerations
- **Dynamic imports**: Stoplight Elements loaded using dynamic imports to improve initial load time
- **Client-side caching**: JWT tokens and authentication state cached in localStorage
- **Hydration handling**: Components designed to prevent hydration mismatches with server rendering

## Key Files & Components

### Core Documentation Platform (Phase 1)
- **`api-docs/components/ApiViewer.tsx`**: Main Stoplight Elements integration
- **`api-docs/components/ThemeToggle.tsx`**: Light/dark mode toggle
- **`api-docs/styles/stoplight-fixes.css`**: CSS fixes for Stoplight Elements
- **`api-docs/public/api-specs/platform-api.json`**: Sample OpenAPI specification
- **`api-docs/config/sources.json`**: API source configuration
- **`api-docs/config/app-config.json`**: Application configuration

### Authentication System (Phase 2)
#### Client-Side Components:
- **`api-docs/public/login.html`**: Login page with password form
- **`api-docs/public/js/auth.js`**: Client-side authentication script with dynamic config loading
- **`api-docs/components/PasswordProtected.tsx`**: React component for route protection
- **`api-docs/lib/config.ts`**: Configuration utilities including auth state
- **`api-docs/config/app-config.json`**: Configuration file with auth settings including API URL
- **`api-docs/pages/api/config/index.ts`**: API endpoint to expose configuration to client

#### Server-Side Components:
- **`terraform/auth.tf`**: Terraform configuration for AWS infrastructure
- **`terraform/files/docs_auth_lambda.js`**: Lambda function for password verification
- **`terraform/files/generate-password-hash.js`**: Utility for generating password hashes

#### Authentication Flow:
1. `app-config.json` controls whether auth is enabled via `features.auth.enabled` and contains API URL
2. Client-side scripts load configuration from `/api/config` endpoint to get auth settings
3. `PasswordProtected.tsx` checks auth settings on the React side
4. `auth.js` independently checks auth settings for non-React pages
5. Both components skip auth checks when `features.auth.enabled` is `false`
6. When authentication is needed, auth.js uses the API URL from config to send requests

### Automated Spec Collection (Phase 3 ✅)
- **`api-docs/scripts/collect-specs.go`**: Go implementation for API spec collection
- **`api-docs/scripts/collect-specs.ts`**: TypeScript wrapper for Go implementation
- **`api-docs/config/sources.json`**: Configuration for API sources and generator commands
- **`api-docs/.github/workflows/collect-specs.yml`**: GitHub Actions workflow (currently disabled for testing)

## Development & Deployment Guide

### Prerequisites
- Node.js 16+ and npm/yarn
- AWS account with appropriate permissions (for auth features)
- Terraform CLI (for auth features)
- Git
- Go 1.19+ (for spec collection)

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd test-doc-v2
   ```

2. **Install dependencies:**
   ```bash
   cd api-docs
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at http://localhost:3000

### Authentication Setup (Phase 2)

1. **Configure AWS credentials:**
   Ensure you have AWS credentials configured with appropriate permissions for:
   - Lambda function creation
   - API Gateway
   - IAM role management

2. **Create Terraform variables file:**
   ```bash
   cd terraform
   cp terraform.tfvars.example terraform.tfvars
   ```

3. **Generate JWT secret:**
   ```bash
   openssl rand -base64 32
   ```
   Add this value as `docs_auth_jwt_secret` in your `terraform.tfvars` file.

4. **Generate a secure password hash:**
   ```bash
   cd terraform
   node files/generate-password-hash.js your-secure-password
   ```
   Add the generated hash as `docs_auth_password_hash` in your `terraform.tfvars` file.

5. **Deploy the AWS Lambda authentication service:**
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```

6. **Update the API URL in the application configuration:**
   ```json
   // In api-docs/config/app-config.json
   {
     "features": {
       "auth": {
         "enabled": true,
         "provider": "password",
         "passwordProtected": true,
         "apiUrl": "https://your-api-gateway-url/auth"  // Get this from terraform output
       }
     }
   }
   ```

7. **Authentication configuration:**
   The `api-docs/config/app-config.json` file now contains all authentication settings:
   
   ```json
   {
     "features": {
       "auth": {
         "enabled": true,  // Set to false to disable authentication completely
         "provider": "password",
         "passwordProtected": true,
         "apiUrl": "https://your-api-gateway-url/auth",  // API Gateway URL from terraform output
         "tokenKey": "docs_auth_token",  // Local storage key for the JWT token
         "expiryKey": "docs_auth_expiry"  // Local storage key for token expiration
       }
     }
   }
   ```
   
   **Important**: 
   - When `auth.enabled` is set to `false`, the application will skip all authentication checks and allow direct access to documentation
   - The auth.js script now reads these configuration values from the /api/config endpoint

### Deployment to GitHub Pages

1. **Build the Next.js application:**
   ```bash
   cd api-docs
   npm run build
   npm run export  # Creates out directory with static files
   ```

2. **Configure GitHub Pages:**
   - Set up a GitHub repository for the project
   - Configure GitHub Pages to use the `main` branch `/docs` folder
   - Copy the contents of the `out` directory to the `docs` directory
   - Push changes to GitHub

3. **Updating Authentication Configuration:**
   - If using a CNAME, update the API URL in `auth.js` to point to your API Gateway endpoint
   - Test authentication flow to ensure correct configuration

### Password Rotation

To change the password:

1. Generate a new password hash:
   ```bash
   node terraform/files/generate-password-hash.js new-secure-password
   ```

2. Update Terraform variables:
   ```bash
   # In terraform/terraform.tfvars
   docs_auth_password_hash = "sha256:new-salt:new-hash"
   ```

3. Apply the Terraform changes:
   ```bash
   cd terraform
   terraform apply
   ```

### API Spec Collection

To collect API specifications from source repositories:

1. **Configure source repositories**:
   Update `api-docs/config/sources.json` with the correct local paths to your repositories:
   ```json
   {
     "apis": [
       {
         "id": "example-api",
         "name": "Example API",
         "specPath": "/api-specs/example-api.json",
         "sourceRepo": "https://github.com/org/repo",
         "localPath": "/path/to/local/clone",
         "generatorType": "typescript",
         "generatorCommand": "npm run generate:spec"
       }
     ]
   }
   ```

2. **Install dependencies**:
   ```bash
   cd api-docs
   npm install
   ```

3. **Install Go**:
   Make sure Go 1.19+ is installed on your system.

4. **Run the collection script**:
   ```bash
   cd api-docs
   npm run collect-specs
   ```

5. **Verify collected specs**:
   Check the `api-docs/public/api-specs/` directory for the generated specification files.

## Troubleshooting & Common Issues

### Authentication Issues

#### Enabling/Disabling Authentication
To toggle authentication on or off:
1. Update `api-docs/config/app-config.json` and set `features.auth.enabled` to `true` or `false`
2. If you're still being redirected to the login page when auth is disabled:
   - Clear your browser's localStorage for the site
   - Ensure you've restarted the development server after changing the config
   - Check browser console for any JavaScript errors

#### Client-Side Authentication Script Issues
If you encounter errors related to `auth.js` script (like "Identifier has already been declared"):
1. The script is designed to prevent multiple initialization using `window.docsAuthInitialized` flag
2. The script is included from both `login.html` and `Layout.tsx`, but should only execute once
3. Script first loads configuration from `/api/config` endpoint, including the API URL and storage keys
4. Script then checks if auth is enabled via API config before attempting any redirects
5. All auth configuration is centralized in `api-docs/config/app-config.json`

#### API Gateway CORS Errors
If you see CORS errors in the browser console when trying to authenticate:
1. Check that the API Gateway CORS configuration in Terraform (`auth.tf`) matches your GitHub Pages domain
2. Ensure the `Access-Control-Allow-Origin` header is set properly in the Lambda response

#### JWT Token Validation Failures
If authentication succeeds but you're immediately redirected to login:
1. Check browser console for JWT validation errors
2. Verify that the `JWT_SECRET` environment variable in Lambda matches your Terraform config
3. Ensure your system clocks are synchronized (JWT validation is time-sensitive)

### Stoplight Elements Issues

#### Dark Mode Inconsistencies
Stoplight Elements has inconsistent dark mode support:
1. Check `stoplight-fixes.css` for custom CSS variables
2. Test on different browsers to verify appearance

#### Large Icons
If icons appear oversized:
1. Add specific CSS rules in `stoplight-fixes.css` to constrain icon sizes
2. Example: `.elements-container svg.sl-icon { max-width: 24px !important; max-height: 24px !important; }`

### Next.js Static Export Issues

#### API Routes Not Working
API routes don't work with static export (`next export`):
1. Ensure all API functionality is moved to external services (AWS Lambda)
2. Remove any dependencies on Next.js API routes

#### Hydration Errors
If you see hydration mismatch errors:
1. Ensure components use proper client-side mounting checks
2. Use the `mounted` state pattern as shown in `Header.tsx` and `PasswordProtected.tsx`

## Future Enhancements

For Phase 3 and beyond, consider:

1. **Multiple API Specs Management**:
   - Automated discovery of API specs in repositories
   - Version control and tagging system for specs

2. **Enhanced Authentication**:
   - Role-based access control
   - Different access levels for different API specs

3. **Performance Optimization**:
   - Code splitting for large API specs
   - Caching strategies for spec loading

4. **Documentation Enhancements**:
   - Markdown-based guides and tutorials
   - Integration with existing documentation systems
   - Support for different layout options (sidebar/stacked)
   - Style overrides to maintain consistent branding
   - Error handling and loading states
   - Custom CSS fixes to ensure proper rendering

2. **Mermaid-based Flow Visualizations**
   - Client-side only rendering to avoid SSR issues
   - Custom styling to match documentation theme
   - Support for sequence diagrams and flowcharts
   - Dynamic diagram generation from structured data

3. **Multi-API Flow Documentation**
   - Step-by-step flow visualization
   - Support for cross-service API flows
   - Request/response examples for each step
   - Interactive navigation between flow steps

4. **Custom Styled Components**
   - Tailwind CSS for styling
   - Responsive design for mobile and desktop
   - Consistent styling across all components
   - Dedicated CSS for component isolation

5. **API Specification Collection**
   - TypeScript-based collection system
   - Supports both GitHub repositories and local files
   - Assuming all repos in the same Org, and if on github actions file, using the same org permission automatically (no extra auth required)
   - YAML to JSON conversion for OpenAPI specs
   - Caching system to avoid processing unchanged specs
   - Validation of specifications before inclusion

6. GitHub Authentication Implementation
    - TypeScript-based GitHub OAuth integration
    - Whitelist system for authorized GitHub users
    - Protected routes with session validation
    - Custom sign-in and unauthorized access pages (just a simple welcome with same style for unloggin or unauthorized users)




### Project Structure

```
api-docs/
├── .github/workflows     # workflows for fetching specs and publishing the site
├── components/           # React components
├── config/               # Configuration files
│   └── sources.json      # API source definitions
│   └── whitelist.txt     # Github handles list (permitting same org visiting and partners visiting
├── content/              # Markdoc content
│   └── api-flows/        # predefined API flows in markdown
├── markdoc/              # Markdoc configuration
├── pages/                # Next.js pages
│   ├── api-docs/         # API reference pages
│   ├── api-flows/        # API flow pages
│   └── index.tsx         # Homepage
├── public/               # Static assets
│   └── api-specs/        # Collected API specifications
├── scripts/              # Utility scripts
│   ├── collect-specs.ts  # API spec collection
│   ├── generate-all-specs.ts # Local spec generation
│   └── sync-service-tags.ts  # Release tag sync
└── styles/               # CSS styles
    ├── globals.css       # Global styles
    └── stoplight-fixes.css # Stoplight style fixes
```

## Technical Solutions Implemented

### Server-Side Rendering Issues

Solved Mermaid SSR issues with:
- Dynamic imports with Next.js `dynamic()` function
- Client-side only rendering using `useEffect`
- Component state to track client-side rendering

### Style Conflict Resolution

Fixed styling conflicts between components:
- Isolated CSS rules with specific selectors
- Applied `!important` flags to critical styles
- Used inline styles for component-specific styling
- Implemented style reset for Stoplight Elements

### API Specification Processing

Enhanced API spec collection with:
- Local file support with path resolution
- Validation of OpenAPI specifications
- Caching based on file hash
- Graceful error handling for missing files

### Integration with External Services

Implemented flexible integration with:
- Support for local and remote OpenAPI specs
- Release tag detection and synchronization
- Automated specification collection from repositories

### UI/UX ###
- light/dark mode switch
- natively supported mobile navigation

## Improvements

1. **Feature Enhancements**
   - Add search functionality across all documentation
   - Implement versioned documentation
   - Add language-specific code samples
   - Include testing tools for API endpoints

2. **Documentation Expansion**
   - Add more API flow examples
   - Include end-to-end workflow documentation
   - Create developer guides for common scenarios
   - Add troubleshooting sections
