/**
 * MCP Portal GitHub Stars
 * Fetches and displays GitHub stars for repositories
 */

document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on the tools page
  const isToolsPage = document.querySelector('.tools-grid') !== null;
  
  if (isToolsPage) {
    fetchGitHubStars();
  }
});

// Function to fetch GitHub stars
function fetchGitHubStars() {
  const starElements = document.querySelectorAll('.github-stars');
  
  starElements.forEach(element => {
    const githubUrl = element.getAttribute('data-github-url');
    if (!githubUrl) return;
    
    // Extract owner and repo from GitHub URL
    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return;
    
    const owner = match[1];
    const repo = match[2];
    
    // API URL for repository
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
    
    // Fetch stars count
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Update stars count in the element
        const starsCountElement = element.querySelector('.stars-count');
        if (starsCountElement) {
          const starsCount = data.stargazers_count;
          starsCountElement.textContent = starsCount.toLocaleString();
          
          // Add title attribute for tooltip
          element.setAttribute('title', `${starsCount.toLocaleString()} GitHub stars`);

          // Add data attribute for sorting
          const card = element.closest('.tool-card');
          if (card) {
            card.setAttribute('data-stars', starsCount);
          }
        }
      })
      .catch(error => {
        console.error('Error fetching GitHub stars:', error);
        const starsCountElement = element.querySelector('.stars-count');
        if (starsCountElement) {
          starsCountElement.textContent = 'N/A';
        }
      });
  });
}