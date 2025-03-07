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

### Phase 3: Manual Spec Management ✅
- Simple sources configuration in JSON format
- Sample API specification generator for development
- Easy addition of new API documentation
- Support for multiple API specifications in the same interface
- No external dependencies for spec generation

### Phase 4: GitHub Pages Deployment ✅
- GitHub Actions workflow for automatic deployment
- Static site generation compatible with GitHub Pages
- Authentication support for protected documentation
- Responsive design with light/dark mode
- Production-ready documentation portal

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

### Phase 3: Manual Spec Management ✅
- Simple sources configuration in JSON format
- Sample API specification generator for development
- Easy addition of new API documentation
- Support for multiple API specifications in the same interface
- No external dependencies for spec generation

### Phase 4: GitHub Pages Deployment ✅
- GitHub Actions workflow for automatic deployment
- Static site generation compatible with GitHub Pages
- Authentication support for protected documentation
- Base path handling for GitHub Pages subdirectory structure
- Production-ready documentation portal

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

### API Specification Management (Phase 3 ✅)
- **`api-docs/config/sources.json`**: Configuration file defining available API specifications
- **`api-docs/scripts/create-sample-specs.js`**: Script to generate sample API specs for development
- **`api-docs/public/api-specs/`**: Directory containing OpenAPI specification files
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

1. **Automatic Deployment with GitHub Actions:**
   - The project includes a GitHub Actions workflow file in the repository root at `.github/workflows/deploy.yml`
   - This workflow automatically builds and deploys the site to GitHub Pages on push to the main branch
   - The workflow will create sample API specs if none exist in the repository
   - You can also trigger a deployment manually from the Actions tab in GitHub

2. **Configure GitHub Pages in Repository Settings:**
   - Go to your repository settings on GitHub
   - Navigate to the Pages section
   - Set the source to "GitHub Actions"
   - If using a custom domain, enter it in the Custom domain field

3. **Updating Configuration for Deployment:**
   - Update your API Gateway URL in `api-docs/config/app-config.json` under `features.auth.apiUrl`
   - If using a custom domain, set the appropriate CORS headers in your API Gateway configuration
   - Test authentication flow to ensure correct configuration after deployment

4. **Manual Build (if needed):**
   ```bash
   cd api-docs
   npm run build
   # The static output will be in the 'out' directory
   ```

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

### API Specifications

To create and manage API specifications:

1. **Configure API sources**:
   Update `api-docs/config/sources.json` to define your API specifications:
   ```json
   {
     "apis": [
       {
         "id": "example-api",
         "name": "Example API",
         "specPath": "/api-specs/example-api.json",
         "version": "1.0.0"
       }
     ]
   }
   ```

2. **Create sample specifications** (for development):
   ```bash
   cd api-docs
   npm run create-sample-specs
   ```

3. **Add real specifications**:
   Place your OpenAPI/Swagger JSON files in the `api-docs/public/api-specs/` directory
   with filenames matching the `specPath` values in your sources.json file.

4. **Verify specifications**:
   Start the development server and check that your API specifications are displayed correctly.
   ```bash
   cd api-docs
   npm run dev
   ```

## Troubleshooting & Common Issues

### Deployment Path Resolution

#### GitHub Pages Repository Path Issues
When deploying to GitHub Pages, you may encounter path-related issues:
1. Make sure the Next.js configuration correctly handles the repository name
2. Check browser console for 404 errors on scripts and static assets
3. If you deploy to a different repository, the base path detection should handle it automatically
4. The login.html page uses special path detection code for GitHub Pages environments

#### Authentication and Path Resolution
Authentication on GitHub Pages requires careful path handling:
1. The static config file must be available at `/api/config.json`
2. All API requests must use absolute URLs with the correct base path
3. Redirects must include the base path to avoid losing the repository context
4. Browser console logs provide detailed information about path detection and API URL resolution

### Authentication System Architecture

The authentication system is designed to work in both development and production environments:

#### Development Mode (Next.js Server)
1. In development, Next.js API routes are used to serve the configuration data
2. The auth.js script fetches configuration from the `/api/config` endpoint  
3. The API route reads from the app-config.json file and returns it to the client
4. Path handling automatically detects development environment and uses root paths

#### Production Mode (Static Export)
1. During the build process, Next.js exports a static version of the site
2. The build script automatically copies `app-config.json` to `public/api/config.json`
3. The auth.js script first tries the API endpoint, then falls back to the static JSON file
4. All path references include the repository name prefix for GitHub Pages
5. The `isPasswordAuthEnabled()` function checks both the API and static config file

### Authentication Issues

#### Enabling/Disabling Authentication
To toggle authentication on or off:
1. Update `api-docs/config/app-config.json` and set `features.auth.enabled` to `true` or `false`
2. If you're still being redirected to the login page when auth is disabled:
   - Clear your browser's localStorage for the site
   - Ensure you've restarted the development server after changing the config
   - Check browser console for any JavaScript errors

#### Path Resolution for Authentication Files
The authentication system needs proper path resolution to function correctly:
1. The `auth.js` script must be loaded with the correct base path
   - In Layout.tsx: `src={${process.env.NODE_ENV === 'production' ? `/${process.env.REPOSITORY_NAME}` : ''}/js/auth.js}`
2. The favicon.ico and other static assets must also use the dynamic path
   - Use the same pattern for all static resources: `${process.env.NODE_ENV === 'production' ? `/${process.env.REPOSITORY_NAME}` : ''}/path/to/resource`
3. The Next.js config handles this automatically for most resources, but explicit paths need manual handling

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

#### Config Not Found Errors
If you see errors about missing configuration:
1. Make sure the API route is working in development mode
   - Check `/api/config` in your browser
2. For production, verify that `public/api/config.json` exists after building
   - The Next.js config should automatically copy this file
3. Check browser console for the specific URLs being attempted

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

For next phases, consider:

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

### GitHub Pages Base Path Handling
- Implemented dynamic repository name detection for GitHub Pages URLs
- Created auto-discovery of base paths based on deployment location
- Updated all asset references to include base path when deployed
- Added automatic path correction for static HTML files and JavaScript
- Developed a unified path resolution strategy that works across all environments

### Server-Side Rendering Issues
- Solved Stoplight Elements SSR issues with Next.js dynamic imports
- Implemented client-side only rendering using `useEffect` hooks
- Added component state to track client-side rendering and prevent hydration mismatches

### Authentication for Static Sites
- Created a JWT-based authentication system compatible with static hosting
- Implemented client-side protection for routes without server requirements
- Added detection for authentication status with secure token storage
- Built support for toggling authentication on/off via configuration

### Style Conflict Resolution
- Resolved dark mode inconsistencies in Stoplight Elements
- Applied targeted CSS overrides for documentation components
- Implemented custom theme classes for Stoplight compatibility
- Created responsive layouts for both desktop and mobile viewing

### API Specification Management
- Added support for multiple API specifications in a single interface
- Created sample specification generator for development
- Implemented configuration-based API source definition
- Built flexible path handling for API specification loading
- Added graceful error handling with fallback sample specs

### Static Site Optimization
- Configured Next.js for optimal static site generation
- Implemented asset optimization for production builds
- Created development utilities that work in both local and production environments
- Ensured compatibility with GitHub Pages hosting requirements

## Planned Improvements for Phase 5

1. **Configuration and Deployment**
   - Add deployment configuration system to store GitHub Pages URL in config
   - Implement centralized environment detection (dev/staging/production)
   - Create automatic GitHub repository metadata collection
   - Make base path and asset loading fully dynamic across environments
   - Implement versioning for API specifications

2. **Navigation and User Experience**
   - Make header navigation dynamic based on available APIs
   - Add search functionality across all documentation
   - Implement breadcrumbs for better navigation
   - Add mobile optimizations for API documentation

3. **Custom Domain Support**
   - Move from GitHub Pages subdirectory to custom domain
   - Update base path configuration for root path serving
   - Configure SSL certificates for secure connections
   - Update CORS settings in API Gateway

4. **Enhance Authentication**
   - Add support for GitHub OAuth authentication
   - Create role-based access for different API specs
   - Add whitelisting for organization members
   - Improve token refresh mechanism and security

5. **Documentation Expansion**
   - Add more API flow examples with Mermaid diagrams
   - Include end-to-end workflow documentation
   - Create developer guides for common scenarios
   - Add comprehensive troubleshooting sections

## Project Status and Next Steps

The API Documentation Platform has now reached a stable state with all major features implemented:

1. **✅ Core Functionality Complete**:
   - Interactive API reference viewing
   - Multiple API specification support
   - Responsive, mobile-friendly UI
   - Dark/light mode theming

2. **✅ Authentication System Working**:
   - Secure JWT-based authentication
   - AWS Lambda for password verification
   - Configurable on/off toggle
   - Browser storage with proper expiration

3. **✅ GitHub Pages Deployment**:
   - Automatic deployment via GitHub Actions
   - Dynamic path handling for any repository name
   - Static site generation with proper asset references
   - Configuration correctly loaded in all environments

4. **⏩ Ready for Real API Specifications**:
   - Sample API specification generator ready for testing
   - Configuration structure prepared for multiple APIs
   - Path resolution works for any specification path
   - Test deployment confirmed working

### Immediate Action Items

1. Create and add real API specifications to the `/api-specs/` directory
2. Test with multiple specifications to verify navigation
3. Update header to support dynamic navigation based on available APIs
4. When ready, consider moving to a custom domain

### Suggested Testing Workflow

1. Make changes locally and test with `npm run dev`
2. Generate sample specs with `npm run create-sample-specs`
3. Push changes to GitHub for automatic deployment
4. Verify functionality on GitHub Pages deployment
5. Check browser console for any path-related errors
