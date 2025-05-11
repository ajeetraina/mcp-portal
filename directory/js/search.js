// Search Functionality for Global MCP Server Directory

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    
    if (searchInput) {
        searchInput.addEventListener('input', performSearch);
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                performSearch();
            }
        });
    }
});

function performSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    
    if (searchTerm.length < 2) {
        // Don't search for very short terms
        return;
    }
    
    // Load the MCP servers data
    fetch('/directory/data/mcp-servers.json')
        .then(response => response.json())
        .then(data => {
            // Search through countries and servers
            const results = searchServers(data, searchTerm);
            
            // Redirect to results page if we're on index
            if (window.location.pathname.endsWith('/directory/') || 
                window.location.pathname.endsWith('/directory/index.html')) {
                // Store results in sessionStorage
                sessionStorage.setItem('searchResults', JSON.stringify(results));
                sessionStorage.setItem('searchTerm', searchTerm);
                
                // Redirect to search results page
                window.location.href = '/directory/search-results.html';
            } else {
                // If we're already on the search results page, update results
                displaySearchResults(results, searchTerm);
            }
        })
        .catch(error => {
            console.error('Error during search:', error);
        });
}

function searchServers(data, searchTerm) {
    let results = {
        countries: [],
        servers: []
    };
    
    // Search countries
    data.countries.forEach(country => {
        if (country.name.toLowerCase().includes(searchTerm)) {
            results.countries.push(country);
        }
        
        // Search servers within this country
        country.servers.forEach(server => {
            // Search in server name, category, description, and features
            if (server.name.toLowerCase().includes(searchTerm) ||
                server.category.toLowerCase().includes(searchTerm) ||
                server.description.toLowerCase().includes(searchTerm) ||
                server.features.some(feature => feature.toLowerCase().includes(searchTerm))) {
                
                // Add server with country reference
                results.servers.push({
                    ...server,
                    countryCode: country.code,
                    countryName: country.name
                });
            }
        });
    });
    
    // Also search categories
    let matchingCategories = data.categories.filter(category => 
        category.name.toLowerCase().includes(searchTerm) ||
        category.description.toLowerCase().includes(searchTerm)
    );
    
    results.categories = matchingCategories;
    
    return results;
}

function displaySearchResults(results, searchTerm) {
    // This function would be defined in the search-results.html page
    if (typeof updateSearchResultsDisplay === 'function') {
        updateSearchResultsDisplay(results, searchTerm);
    }
}
