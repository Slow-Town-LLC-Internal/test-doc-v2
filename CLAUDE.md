# Development Guidelines for API Documentation Platform

## Build & Test Commands
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Run all tests
npm test

# Run specific test
npm test -- -t "test name"

# Lint code
npm run lint

# Type check
npm run typecheck
```

## Code Style Guidelines
- **TypeScript**: Use strict typing. Avoid `any` types.
- **Imports**: Group and sort (1-standard libraries, 2-external packages, 3-internal modules)
- **Formatting**: Use Prettier with default configuration
- **Naming**: camelCase for variables/functions, PascalCase for classes/components/types
- **Components**: Functional components with React hooks
- **Error Handling**: Use try/catch blocks with custom error types
- **Styling**: Use Tailwind CSS with component-specific modules
- **API Flow Documentation**: Follow mermaid diagram syntax for consistency
- **Documentation**: JSDoc comments for public APIs and components