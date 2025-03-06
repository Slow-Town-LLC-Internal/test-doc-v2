// This script adds the necessary base path handling for GitHub Pages
(function() {
  // Detect if we're running on GitHub Pages
  const isGitHubPages = window.location.hostname.includes('github.io');
  
  if (isGitHubPages) {
    // Extract repository name from path
    const pathParts = window.location.pathname.split('/');
    // The first part after the hostname should be the repo name
    if (pathParts.length > 1 && pathParts[1]) {
      window.basePath = '/' + pathParts[1];
    } else {
      window.basePath = '';
    }
  } else {
    window.basePath = '';
  }
  
  console.log('Detected base path:', window.basePath);
})();