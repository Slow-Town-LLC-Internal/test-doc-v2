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

import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// Determine the project root
const projectRoot = path.resolve(__dirname, '..');

// Check if Go is installed
function checkGoInstallation(): Promise<boolean> {
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
async function executeGoCollector(): Promise<void> {
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

// Main function
async function main(): Promise<void> {
  console.log('Starting API specification collection...');
  
  const hasGo = await checkGoInstallation();
  if (!hasGo) {
    console.error('Error: Go is not installed. Please install Go to use this script.');
    process.exit(1);
  }
  
  try {
    await executeGoCollector();
    console.log('API specification collection completed successfully.');
  } catch (error) {
    console.error('Failed to collect API specifications:', error);
    process.exit(1);
  }
}

main();