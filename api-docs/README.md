# API Documentation Platform

This project provides a platform for API documentation with interactive API references using Stoplight Elements.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- GitHub account (for authentication)

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
```

Edit `.env.local` to add your GitHub OAuth credentials.

### Setting up GitHub Authentication

1. Create a GitHub OAuth app at https://github.com/settings/developers
   - Set Homepage URL to your site URL (e.g., http://localhost:3000)
   - Set Authorization callback URL to your site URL + /api/auth/callback/github

2. Copy the Client ID and Client Secret to your `.env.local` file
3. Generate a random secret for NEXTAUTH_SECRET (e.g., `openssl rand -base64 32`)
4. Add GitHub handles to `config/whitelist.txt`
5. Enable authentication in `config/app-config.json` by setting `features.auth.enabled` to `true`

### Development

```bash
# Start development server
npm run dev
```

The application will be available at http://localhost:3000.

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Project Structure

- `/components` - React components
- `/config` - Configuration files
  - `sources.json` - API source definitions
  - `whitelist.txt` - GitHub handles whitelist (for authentication)
- `/pages` - Next.js pages
  - `/api-docs` - API reference pages
- `/public` - Static assets
  - `/api-specs` - API specifications in JSON format
- `/scripts` - Utility scripts
- `/styles` - CSS files

## Adding New API Specifications

1. Add the specification file to `/public/api-specs/`
2. Update `/config/sources.json` to include the new API

## Implementation Plan

### Phase 1: Core Documentation Platform (Current)
- Interactive API reference using Stoplight Elements
- Light/dark mode support
- Responsive design

### Phase 2: Authentication (Upcoming)
- GitHub OAuth integration
- Whitelist-based access control

### Phase 3: Automated Spec Collection (Future)
- GitHub Actions workflow
- Automatic API spec collection from repositories