// World Map Functionality for Global MCP Server Directory

document.addEventListener('DOMContentLoaded', function() {
    // Load the SVG world map
    fetch('/directory/assets/images/world-map.svg')
        .then(response => response.text())
        .then(svgData => {
            document.getElementById('world-map').innerHTML = svgData;
            initializeMap();
        })
        .catch(error => {
            console.error('Error loading world map SVG:', error);
            document.getElementById('world-map').innerHTML = '<div class="alert alert-danger">Error loading world map. Please try refreshing the page.</div>';
        });
});

function initializeMap() {
    // Load the MCP servers data
    fetch('/directory/data/mcp-servers.json')
        .then(response => response.json())
        .then(data => {
            highlightCountries(data);
            setupCountryClicks(data);
            updateStats(data);
        })
        .catch(error => {
            console.error('Error loading MCP servers data:', error);
        });
}

function highlightCountries(data) {
    // Get all country paths from the SVG
    const countryPaths = document.querySelectorAll('#world-map svg .country');
    
    // Create an array of country codes that have MCP servers
    const countriesWithServers = data.countries.map(country => country.code);
    
    // Highlight countries with servers
    countryPaths.forEach(path => {
        const countryCode = path.getAttribute('id') || path.getAttribute('data-code');
        
        if (countryCode && countriesWithServers.includes(countryCode)) {
            path.classList.add('has-servers');
            
            // Add tooltip with country name and number of servers
            const country = data.countries.find(c => c.code === countryCode);
            if (country) {
                const tooltip = document.createElementNS("http://www.w3.org/2000/svg", "title");
                tooltip.textContent = `${country.name} (${country.servers.length} MCP servers)`;
                path.appendChild(tooltip);
            }
        }
    });
}

function setupCountryClicks(data) {
    // Get all country paths from the SVG
    const countryPaths = document.querySelectorAll('#world-map svg .country');
    
    // Add click event to countries with servers
    countryPaths.forEach(path => {
        const countryCode = path.getAttribute('id') || path.getAttribute('data-code');
        
        if (countryCode) {
            const country = data.countries.find(c => c.code === countryCode);
            
            if (country) {
                path.addEventListener('click', function() {
                    window.location.href = `/directory/countries/${countryCode}.html`;
                });
                
                // Change cursor on hover
                path.style.cursor = 'pointer';
            }
        }
    });
}

function updateStats(data) {
    // Update the statistics shown on the page
    document.getElementById('country-count').textContent = data.metadata.totalCountries;
    document.getElementById('server-count').textContent = data.metadata.totalServers;
    document.getElementById('category-count').textContent = data.metadata.totalCategories;
}
