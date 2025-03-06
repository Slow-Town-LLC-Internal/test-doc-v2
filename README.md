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

### Phase 2: Authentication Layer (Next)
- GitHub OAuth authentication
- Whitelist-based access control using a simple text file
- Protected routes with session validation
- Custom sign-in and unauthorized access pages

### Phase 3: Automated Spec Collection (Future)
- GitHub Actions workflow to scan organization repositories
- Automatic spec validation and processing
- Support for both manual triggering and schedule-based execution
- Rebuild and deployment pipeline
- Optional Golang scripts for performance-critical operations

## Current Progress

The Phase 1 implementation includes:
- Next.js project with TypeScript and Tailwind CSS
- Stoplight Elements integration for API documentation
- Light/dark mode toggle with theme persistence
- Responsive design for mobile and desktop
- Sample API specification (Platform API)
- Configuration system for managing API sources

### Implementation Components

1. **Stoplight Elements Integration**
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
