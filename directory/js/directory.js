// General Directory Functionality for Global MCP Server Directory

document.addEventListener('DOMContentLoaded', function() {
    // Initialize copy buttons for code blocks
    initializeCodeCopyButtons();
    
    // Load recent servers on the homepage
    if (isHomePage()) {
        loadRecentServers();
    }
});

function isHomePage() {
    return window.location.pathname.endsWith('/directory/') ||
           window.location.pathname.endsWith('/directory/index.html');
}

function initializeCodeCopyButtons() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(block => {
        // Create container for relative positioning
        const container = document.createElement('div');
        container.className = 'code-container';
        
        // Add copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = 'Copy';
        copyButton.addEventListener('click', function() {
            navigator.clipboard.writeText(block.textContent).then(() => {
                copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyButton.textContent = 'Copy';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        });
        
        // Replace the code block with our container
        const parent = block.parentNode;
        parent.parentNode.insertBefore(container, parent);
        container.appendChild(parent);
        container.appendChild(copyButton);
    });
}

function loadRecentServers() {
    // Load the MCP servers data
    fetch('/directory/data/mcp-servers.json')
        .then(response => response.json())
        .then(data => {
            displayRecentServers(data);
        })
        .catch(error => {
            console.error('Error loading MCP servers data:', error);
        });
}

function displayRecentServers(data) {
    const recentServersContainer = document.getElementById('recent-servers');
    
    if (!recentServersContainer) {
        return;
    }
    
    // Clear existing content
    recentServersContainer.innerHTML = '';
    
    // Flatten all servers with country info
    let allServers = [];
    data.countries.forEach(country => {
        country.servers.forEach(server => {
            allServers.push({
                ...server,
                countryCode: country.code,
                countryName: country.name
            });
        });
    });
    
    // Sort by date added (most recent first)
    allServers.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    
    // Take only the 6 most recent
    const recentServers = allServers.slice(0, 6);
    
    // Create cards for each server
    recentServers.forEach(server => {
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';
        card.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${server.name}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">${getCountryFlag(server.countryCode)} ${server.countryName}</h6>
                    <span class="badge bg-info mb-2">${server.category}</span>
                    <p class="card-text">${truncateText(server.description, 120)}</p>
                </div>
                <div class="card-footer">
                    <a href="countries/${server.countryCode}.html#${server.id}" class="btn btn-sm btn-primary">View Details</a>
                </div>
            </div>
        `;
        recentServersContainer.appendChild(card);
    });
}

function getCountryFlag(countryCode) {
    // This is a simple function to get a flag emoji from a country code
    // Real implementation would have a full mapping
    const flagOffset = 127397; // Offset to convert ASCII to regional indicator symbols
    const emoji = Array.from(countryCode.toUpperCase())
        .map(char => String.fromCodePoint(char.charCodeAt(0) + flagOffset))
        .join('');
    return emoji;
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength - 3) + '...';
}
