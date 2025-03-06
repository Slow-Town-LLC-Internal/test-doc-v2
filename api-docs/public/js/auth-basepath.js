// This script adds the necessary base path handling for GitHub Pages
(function() {
  // Detect if we're running on GitHub Pages
  // If URL includes the repository name, we're on GitHub Pages
  const isGitHubPages = window.location.hostname.includes('github.io');
  
  // Set the base path if we're on GitHub Pages
  window.basePath = isGitHubPages ? '/test-doc-v2' : '';
})();