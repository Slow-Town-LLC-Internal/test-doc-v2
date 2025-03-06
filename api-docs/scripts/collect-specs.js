/**
 * API Specification Collection Script
 * 
 * This script:
 * 1. Reads the list of API sources from config/sources.json
 * 2. For each source, executes the appropriate generator command
 * 3. Collects and validates the OpenAPI specification files
 * 4. Converts YAML to JSON if needed
 * 5. Saves the processed specifications to public/api-specs/
 *
 * GitHub Actions can run this script to keep the API documentation up to date.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Determine the project root
const projectRoot = path.resolve(__dirname, '..');

// Check if Go is installed
function checkGoInstallation() {
  return new Promise((resolve) => {
    const goVersion = spawn('go', ['version']);
    
    goVersion.on('close', (code) => {
      resolve(code === 0);
    });
    
    goVersion.on('error', () => {
      resolve(false);
    });
  });
}

// Execute the Go script
function executeGoCollector() {
  const goScriptPath = path.join(__dirname, 'collect-specs.go');
  
  return new Promise((resolve, reject) => {
    console.log(`Executing Go script at ${goScriptPath}`);
    
    const goRun = spawn('go', ['run', goScriptPath], { cwd: projectRoot });
    
    goRun.stdout.on('data', (data) => {
      console.log(`${data}`);
    });
    
    goRun.stderr.on('data', (data) => {
      console.error(`${data}`);
    });
    
    goRun.on('close', (code) => {
      if (code === 0) {
        console.log('Go script executed successfully');
        resolve();
      } else {
        reject(new Error(`Go script exited with code ${code}`));
      }
    });
  });
}

// Function to copy the sample API spec if needed
function copySampleApiSpec() {
  const specsDir = path.join(projectRoot, 'public', 'api-specs');
  const targetFile = path.join(specsDir, 'platform-api.json');
  const sampleFile = path.join(__dirname, 'sample-platform-api.json');
  
  // Copy sample file if target doesn't exist
  if (!fs.existsSync(targetFile) && fs.existsSync(sampleFile)) {
    console.log('Copying sample API spec for platform-api.json');
    fs.copyFileSync(sampleFile, targetFile);
    return true;
  }
  return false;
}

// Main function
async function main() {
  console.log('Starting API specification collection...');
  
  // Ensure the api-specs directory exists
  const specsDir = path.join(projectRoot, 'public', 'api-specs');
  if (!fs.existsSync(specsDir)) {
    console.log(`Creating directory: ${specsDir}`);
    fs.mkdirSync(specsDir, { recursive: true });
  }
  
  const hasGo = await checkGoInstallation();
  if (!hasGo) {
    console.error('Error: Go is not installed. Please install Go to use this script.');
    console.log('Using sample API spec as fallback...');
    copySampleApiSpec();
    return;
  }
  
  try {
    await executeGoCollector();
    console.log('API specification collection completed successfully.');
    
    // If Go collector didn't create platform-api.json, use the sample
    const platformApiPath = path.join(specsDir, 'platform-api.json');
    if (!fs.existsSync(platformApiPath)) {
      console.log('platform-api.json not found, using sample...');
      copySampleApiSpec();
    }
  } catch (error) {
    console.error('Failed to collect API specifications:', error);
    console.log('Using sample API spec as fallback...');
    copySampleApiSpec();
  }
}

main();