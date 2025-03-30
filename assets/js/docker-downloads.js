/**
 * MCP Portal Docker Hub Downloads
 * Fetches and displays Docker Hub pull counts for MCP servers
 */

document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on the MCP servers page
  const isMcpServersPage = document.querySelector('.mcp-grid') !== null;
  const isServersTablePage = document.querySelector('.server-table') !== null && document.querySelector('.server-table').closest('.server-table-container') !== null;
  
  if (isMcpServersPage || isServersTablePage) {
    fetchDockerHubDownloads();
  }
});

// Function to fetch Docker Hub downloads count
function fetchDockerHubDownloads() {
  // For card view
  const mpcCards = document.querySelectorAll('.mcp-card');
  
  mpcCards.forEach(card => {
    const dockerHubLink = card.querySelector('a.btn-docker');
    if (!dockerHubLink) return;
    
    const dockerHubUrl = dockerHubLink.getAttribute('href');
    const imagePath = getDockerImagePath(dockerHubUrl);
    
    if (imagePath) {
      fetchImageData(imagePath).then(pullCount => {
        // Add download count to card meta
        const cardMeta = card.querySelector('.card-meta');
        if (cardMeta) {
          const downloadsElement = document.createElement('span');
          downloadsElement.className = 'docker-downloads';
          downloadsElement.setAttribute('title', `${pullCount.toLocaleString()} Docker Hub pulls`);
          downloadsElement.innerHTML = `<i class="fas fa-download"></i> <span class="downloads-count">${formatDownloads(pullCount)}</span>`;
          cardMeta.appendChild(downloadsElement);
        }
      }).catch(error => {
        console.error('Error fetching Docker Hub pulls:', error);
      });
    }
  });
  
  // For table view
  if (document.querySelector('.server-table')) {
    const tableRows = document.querySelectorAll('.server-table tbody tr');
    
    tableRows.forEach(row => {
      const dockerLink = row.querySelector('.server-links a');
      if (!dockerLink) return;
      
      const dockerHubUrl = dockerLink.getAttribute('href');
      const imagePath = getDockerImagePath(dockerHubUrl);
      
      if (imagePath) {
        fetchImageData(imagePath).then(pullCount => {
          // Check if there's already a downloads column
          let downloadsCell = row.querySelector('.server-downloads');
          
          // If no downloads cell exists, create one after the status cell
          if (!downloadsCell) {
            const statusCell = row.querySelector('.server-status');
            if (statusCell) {
              downloadsCell = document.createElement('td');
              downloadsCell.className = 'server-downloads';
              statusCell.insertAdjacentElement('afterend', downloadsCell);
            }
          }
          
          // Add the download count
          if (downloadsCell) {
            downloadsCell.innerHTML = `<span class="downloads-badge" title="${pullCount.toLocaleString()} Docker Hub pulls">
              <i class="fas fa-download"></i> ${formatDownloads(pullCount)}
            </span>`;
          }
        }).catch(error => {
          console.error('Error fetching Docker Hub pulls:', error);
        });
      }
    });
    
    // Add header for downloads column if it doesn't exist
    const headerRow = document.querySelector('.server-table thead tr');
    if (headerRow && !headerRow.querySelector('th:nth-child(5)').textContent.includes('Downloads')) {
      const statusHeader = headerRow.querySelector('th:nth-child(4)');
      if (statusHeader) {
        const downloadHeader = document.createElement('th');
        downloadHeader.textContent = 'Downloads';
        statusHeader.insertAdjacentElement('afterend', downloadHeader);
      }
    }
  }
}

// Extract Docker image path from Docker Hub URL
function getDockerImagePath(url) {
  if (!url) return null;
  
  const match = url.match(/hub\.docker\.com\/r\/([^/]+)/i);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

// Fetch image data from Docker Hub API
async function fetchImageData(imagePath) {
  try {
    const response = await fetch(`https://hub.docker.com/v2/repositories/${imagePath}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.pull_count || 0;
  } catch (error) {
    console.error('Error fetching Docker Hub data:', error);
    return 0;
  }
}

// Format large download numbers to be more readable
function formatDownloads(count) {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  } else {
    return count.toString();
  }
}