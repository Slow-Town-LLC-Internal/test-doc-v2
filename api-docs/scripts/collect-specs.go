package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

// SourceConfig represents the sources.json structure
type SourceConfig struct {
	APIs []APIConfig `json:"apis"`
}

// APIConfig represents each API entry in sources.json
type APIConfig struct {
	ID              string `json:"id"`
	Name            string `json:"name"`
	SpecPath        string `json:"specPath"`
	Version         string `json:"version,omitempty"`
	SourceRepo      string `json:"sourceRepo,omitempty"`
	LocalPath       string `json:"localPath,omitempty"`
	ServicePath     string `json:"servicePath,omitempty"`
	GeneratorType   string `json:"generatorType,omitempty"`
	GeneratorCommand string `json:"generatorCommand,omitempty"`
}

func main() {
	log.Println("Starting API specification collection process...")

	// Get the project root
	projectRoot, err := getProjectRoot()
	if err != nil {
		log.Fatalf("Error finding project root: %v", err)
	}

	// Load sources.json
	sourcesFile := filepath.Join(projectRoot, "api-docs", "config", "sources.json")
	sourceConfig, err := loadSourceConfig(sourcesFile)
	if err != nil {
		log.Fatalf("Error loading sources configuration: %v", err)
	}

	// Create output directory if it doesn't exist
	outputDir := filepath.Join(projectRoot, "api-docs", "public", "api-specs")
	err = os.MkdirAll(outputDir, 0755)
	if err != nil {
		log.Fatalf("Error creating output directory: %v", err)
	}

	// Process each API
	for _, api := range sourceConfig.APIs {
		log.Printf("Processing API: %s", api.Name)
		
		if api.LocalPath == "" || api.GeneratorCommand == "" {
			log.Printf("Skipping %s - no local path or generator command specified", api.ID)
			continue
		}

		err := processAPI(api, outputDir)
		if err != nil {
			log.Printf("Error processing API %s: %v", api.ID, err)
		}
	}

	log.Println("API specification collection completed")
}

func getProjectRoot() (string, error) {
	// This assumes the script is in api-docs/scripts directory
	dir, err := os.Getwd()
	if err != nil {
		return "", err
	}
	
	// Check if we're in the scripts directory
	if strings.HasSuffix(dir, filepath.Join("api-docs", "scripts")) {
		return filepath.Dir(filepath.Dir(dir)), nil
	}
	
	// Check if we're in the api-docs directory
	if strings.HasSuffix(dir, "api-docs") {
		return filepath.Dir(dir), nil
	}
	
	// If we're at the project root already
	if _, err := os.Stat(filepath.Join(dir, "api-docs")); err == nil {
		return dir, nil
	}
	
	return "", fmt.Errorf("unable to determine project root from directory: %s", dir)
}

func loadSourceConfig(path string) (*SourceConfig, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		return nil, err
	}

	var config SourceConfig
	err = json.Unmarshal(data, &config)
	if err != nil {
		return nil, err
	}

	return &config, nil
}

func processAPI(api APIConfig, outputDir string) error {
	// Determine the working directory based on service path if provided
	workingDir := api.LocalPath
	if api.ServicePath != "" {
		workingDir = filepath.Join(api.LocalPath, api.ServicePath)
	}

	// Check if directory exists
	if _, err := os.Stat(workingDir); os.IsNotExist(err) {
		return fmt.Errorf("local path does not exist: %s", workingDir)
	}

	// Execute the generator command
	log.Printf("Executing generator command for %s in %s", api.ID, workingDir)
	
	cmdParts := strings.Fields(api.GeneratorCommand)
	cmd := exec.Command(cmdParts[0], cmdParts[1:]...)
	cmd.Dir = workingDir
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("generator command failed: %v", err)
	}

	// Find and copy the generated spec file
	specFile, err := findSpecFile(api, workingDir)
	if err != nil {
		return fmt.Errorf("error finding spec file: %v", err)
	}

	// Copy the spec file to the output directory
	targetPath := filepath.Join(outputDir, filepath.Base(api.SpecPath))
	if err := copyFile(specFile, targetPath); err != nil {
		return fmt.Errorf("error copying spec file: %v", err)
	}

	log.Printf("Successfully processed %s API", api.ID)
	return nil
}

func findSpecFile(api APIConfig, workingDir string) (string, error) {
	// Implementation depends on the generator type
	var searchPatterns []string
	
	switch api.GeneratorType {
	case "typescript":
		searchPatterns = []string{
			filepath.Join(workingDir, "dist", "swagger.json"),
			filepath.Join(workingDir, "dist", "openapi.json"),
			filepath.Join(workingDir, "build", "swagger.json"),
			filepath.Join(workingDir, "build", "openapi.json"),
		}
	case "kotlin":
		searchPatterns = []string{
			filepath.Join(workingDir, "build", "openapi", "openapi.json"),
			filepath.Join(workingDir, "build", "swagger", "swagger.json"),
			filepath.Join(workingDir, "build", "resources", "main", "openapi.json"),
		}
	default:
		return "", fmt.Errorf("unsupported generator type: %s", api.GeneratorType)
	}
	
	// Try each pattern
	for _, pattern := range searchPatterns {
		if _, err := os.Stat(pattern); err == nil {
			return pattern, nil
		}
	}
	
	return "", fmt.Errorf("could not find generated spec file for %s", api.ID)
}

func copyFile(src, dst string) error {
	sourceFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer sourceFile.Close()

	destFile, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer destFile.Close()

	_, err = io.Copy(destFile, sourceFile)
	if err != nil {
		return err
	}

	err = destFile.Sync()
	if err != nil {
		return err
	}

	// Validate that it's a valid JSON file
	destFile.Seek(0, 0)
	var jsonObj interface{}
	decoder := json.NewDecoder(destFile)
	if err := decoder.Decode(&jsonObj); err != nil {
		return fmt.Errorf("invalid JSON in spec file: %v", err)
	}

	return nil
}