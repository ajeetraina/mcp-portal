/**
 * MCP Portal GitHub Stars
 * Fetches and displays GitHub stars for repositories
 * Supports both card view and table view
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize GitHub stars fetching
  fetchGitHubStars();
});

// Cache for API responses to avoid duplicate requests
const starCache = new Map();

// Rate limiting handling
let rateLimitResetTime = null;
let isRateLimited = false;

/**
 * Main function to fetch GitHub stars for all elements
 */
function fetchGitHubStars() {
  // Find all elements that need GitHub stars
  const starElements = document.querySelectorAll('.github-stars, .server-stars');
  
  if (starElements.length === 0) {
    return; // No elements found, exit early
  }

  console.log(`Found ${starElements.length} elements to fetch stars for`);
  
  // Process each element
  starElements.forEach(element => {
    const githubUrl = element.getAttribute('data-github-url') || element.dataset.githubUrl;
    if (!githubUrl) {
      console.warn('No GitHub URL found for element:', element);
      return;
    }
    
    // Extract repository info from URL
    const repoInfo = extractRepoInfo(githubUrl);
    if (!repoInfo) {
      console.warn('Could not extract repository info from URL:', githubUrl);
      setStarCount(element, 'N/A');
      return;
    }
    
    // Check cache first
    const cacheKey = `${repoInfo.owner}/${repoInfo.repo}`;
    if (starCache.has(cacheKey)) {
      const cachedData = starCache.get(cacheKey);
      setStarCount(element, cachedData.stars);
      addTooltip(element, cachedData.stars);
      return;
    }
    
    // Set loading state
    setStarCount(element, '...');
    
    // Fetch stars count
    fetchStarsForRepo(repoInfo.owner, repoInfo.repo)
      .then(starsCount => {
        // Cache the result
        starCache.set(cacheKey, { stars: starsCount, timestamp: Date.now() });
        
        // Update UI
        setStarCount(element, starsCount);
        addTooltip(element, starsCount);
        
        // Add data attribute for sorting (if element is in a card)
        const card = element.closest('.tool-card');
        if (card) {
          card.setAttribute('data-stars', starsCount);
        }
      })
      .catch(error => {
        console.error(`Error fetching stars for ${cacheKey}:`, error);
        setStarCount(element, 'N/A');
      });
  });
}

/**
 * Extract owner and repo from GitHub URL
 */
function extractRepoInfo(githubUrl) {
  try {
    // Handle various GitHub URL formats
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/\?#]+)/,  // Standard format
      /github\.com\/([^\/]+)\/([^\/]+)\/tree\/main\/(.+)/,  // With path
      /github\.com\/([^\/]+)\/([^\/]+)\/blob\/main\/(.+)/   // With blob path
    ];
    
    for (const pattern of patterns) {
      const match = githubUrl.match(pattern);
      if (match) {
        return {
          owner: match[1],
          repo: match[2].replace(/\.git$/, '') // Remove .git suffix if present
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing GitHub URL:', githubUrl, error);
    return null;
  }
}

/**
 * Fetch stars count for a specific repository
 */
async function fetchStarsForRepo(owner, repo) {
  // Check if we're rate limited
  if (isRateLimited && rateLimitResetTime && Date.now() < rateLimitResetTime) {
    throw new Error('Rate limited');
  }
  
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
  
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MCP-Portal-Stars-Fetcher'
      }
    });
    
    // Handle rate limiting
    if (response.status === 403) {
      const rateLimitReset = response.headers.get('X-RateLimit-Reset');
      if (rateLimitReset) {
        rateLimitResetTime = parseInt(rateLimitReset) * 1000;
        isRateLimited = true;
        console.warn(`Rate limited until ${new Date(rateLimitResetTime)}`);
      }
      throw new Error('Rate limited by GitHub API');
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Reset rate limit status on successful request
    isRateLimited = false;
    rateLimitResetTime = null;
    
    return data.stargazers_count || 0;
    
  } catch (error) {
    // If it's a network error, provide a more user-friendly message
    if (error.name === 'TypeError' || error.message.includes('fetch')) {
      throw new Error('Network error');
    }
    throw error;
  }
}

/**
 * Set the star count in the appropriate element
 */
function setStarCount(element, count) {
  // Find the count element - support both naming conventions
  let countElement = element.querySelector('.stars-count') || 
                    element.querySelector('.star-number') ||
                    element.querySelector('.star-count');
  
  if (countElement) {
    if (typeof count === 'number') {
      countElement.textContent = count.toLocaleString();
    } else {
      countElement.textContent = count;
    }
  } else {
    console.warn('Could not find stars count element in:', element);
  }
}

/**
 * Add tooltip with star count information
 */
function addTooltip(element, starsCount) {
  if (typeof starsCount === 'number') {
    element.setAttribute('title', `${starsCount.toLocaleString()} GitHub stars`);
  }
}

/**
 * Utility function to get repository path for API calls
 * (kept for backward compatibility with existing code)
 */
function getRepoPath(githubUrl) {
  const repoInfo = extractRepoInfo(githubUrl);
  return repoInfo ? `${repoInfo.owner}/${repoInfo.repo}` : null;
}

// Export functions for potential external use
window.GitHubStars = {
  fetch: fetchGitHubStars,
  extractRepoInfo: extractRepoInfo,
  getRepoPath: getRepoPath
};