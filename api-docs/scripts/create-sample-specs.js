/**
 * Sample API Specification Creator
 * 
 * This script creates sample API specifications for development and testing.
 * It reads the list of APIs from the config/sources.json file and creates
 * sample specifications for each one in the public/api-specs directory.
 */

const fs = require('fs');
const path = require('path');

// Determine the project root
const projectRoot = path.resolve(__dirname, '..');

// Function to create a sample API spec
function createSampleApiSpec(apiId, apiName, specPath) {
  const specsDir = path.join(projectRoot, 'public', 'api-specs');
  const fullSpecPath = path.join(specsDir, path.basename(specPath));
  
  // Create sample API spec
  const sampleSpec = {
    openapi: '3.0.0',
    info: {
      title: `${apiName} (Sample)`,
      description: `Sample API specification for ${apiName}`,
      version: '1.0.0'
    },
    servers: [
      {
        url: 'https://api.example.com/v1',
        description: 'Production server'
      }
    ],
    paths: {
      '/hello': {
        get: {
          summary: 'Hello World endpoint',
          description: 'Returns a simple greeting message',
          operationId: 'getHello',
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/HelloResponse'
                  }
                }
              }
            }
          }
        }
      },
      [`/${apiId}/example`]: {
        get: {
          summary: `Example ${apiName} endpoint`,
          description: `Demonstrates a sample endpoint for ${apiName}`,
          operationId: `get${apiId.charAt(0).toUpperCase() + apiId.slice(1)}Example`,
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ExampleResponse'
                  }
                }
              }
            }
          }
        }
      }
    },
    components: {
      schemas: {
        HelloResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Hello, world!'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        ExampleResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string',
              example: 'Example resource'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      }
    }
  };
  
  // Ensure the directory exists
  if (!fs.existsSync(specsDir)) {
    console.log(`Creating directory: ${specsDir}`);
    fs.mkdirSync(specsDir, { recursive: true });
  }
  
  // Write the sample spec to file
  fs.writeFileSync(fullSpecPath, JSON.stringify(sampleSpec, null, 2));
  console.log(`Created sample API spec: ${fullSpecPath}`);
}

// Main function
async function main() {
  console.log('Creating sample API specifications...');
  
  try {
    // Read the sources.json file
    const sourcesPath = path.join(projectRoot, 'config', 'sources.json');
    const sourcesContent = fs.readFileSync(sourcesPath, 'utf8');
    const sources = JSON.parse(sourcesContent);
    
    // Create sample specs for each API
    if (sources.apis && Array.isArray(sources.apis)) {
      sources.apis.forEach(api => {
        if (api.id && api.name && api.specPath) {
          createSampleApiSpec(api.id, api.name, api.specPath);
        } else {
          console.error(`Skipping invalid API entry: ${JSON.stringify(api)}`);
        }
      });
    } else {
      console.error('No APIs found in sources.json');
    }
    
    console.log('Sample API specifications created successfully');
  } catch (error) {
    console.error('Error creating sample API specifications:', error);
    process.exit(1);
  }
}

// Run the main function
main();