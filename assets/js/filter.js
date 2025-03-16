/**
 * Filter functionality for MCP servers and tools
 */
document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const searchInput = document.getElementById('search-input');
  const tagFilter = document.getElementById('tag-filter');
  const sortSelect = document.getElementById('sort-select');
  const clearFiltersButton = document.getElementById('clear-filters');
  const activeFiltersContainer = document.querySelector('.active-filters');
  
  // Find all cards (MCP servers or tools)
  const cards = document.querySelectorAll('.mcp-card, .tool-card');
  if (!cards.length) return; // Exit if no cards found
  
  // Collect all unique tags for populating the filter dropdown
  const tagSet = new Set();
  cards.forEach(card => {
    const tags = card.getAttribute('data-tags')?.split(',') || [];
    tags.forEach(tag => {
      if (tag && tag.trim()) {
        tagSet.add(tag.trim());
      }
    });
  });
  
  // Populate tag filter if it exists
  if (tagFilter) {
    // Clear existing options except the first one
    while (tagFilter.options.length > 1) {
      tagFilter.remove(1);
    }
    
    // Add sorted tags
    Array.from(tagSet).sort().forEach(tag => {
      const option = document.createElement('option');
      option.value = tag;
      option.textContent = tag.charAt(0).toUpperCase() + tag.slice(1); // Capitalize first letter
      tagFilter.appendChild(option);
    });
  }
  
  // Filter state
  let filters = {
    search: '',
    tag: '',
  };
  
  // Sorting state
  let currentSort = 'newest';
  
  // Apply filters and sorting
  function applyFilters() {
    let visibleCount = 0;
    
    // Show or hide cards based on filters
    cards.forEach(card => {
      const name = card.getAttribute('data-name')?.toLowerCase() || '';
      const tags = card.getAttribute('data-tags')?.toLowerCase() || '';
      const description = card.querySelector('.card-description')?.textContent.toLowerCase() || '';
      
      // Check if card matches search filter
      const matchesSearch = !filters.search || 
        name.includes(filters.search.toLowerCase()) || 
        tags.includes(filters.search.toLowerCase()) ||
        description.includes(filters.search.toLowerCase());
      
      // Check if card matches tag filter
      const matchesTag = !filters.tag || tags.split(',').includes(filters.tag.toLowerCase());
      
      // Show or hide based on filter match
      if (matchesSearch && matchesTag) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });
    
    // Update clear filters button visibility
    clearFiltersButton.style.display = (filters.search || filters.tag) ? 'block' : 'none';
    
    // Update active filters display
    updateActiveFilters();
    
    // Apply sorting
    applySorting();
    
    // Add no results message if needed
    const existingNoResults = document.querySelector('.no-results-message');
    if (existingNoResults) {
      existingNoResults.remove();
    }
    
    if (visibleCount === 0 && (filters.search || filters.tag)) {
      const container = cards[0].parentElement;
      const noResults = document.createElement('div');
      noResults.className = 'no-results-message';
      noResults.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-search"></i>
          <h3>No matches found</h3>
          <p>No items match your current filters. Try adjusting your search criteria.</p>
          <button class="btn btn-primary" id="reset-search">Reset Filters</button>
        </div>
      `;
      container.appendChild(noResults);
      
      // Add event listener to reset button
      document.getElementById('reset-search').addEventListener('click', clearAllFilters);
    }
  }
  
  // Update active filters display
  function updateActiveFilters() {
    if (!activeFiltersContainer) return;
    
    activeFiltersContainer.innerHTML = '';
    
    if (filters.search) {
      addFilterTag(`Search: ${filters.search}`, () => {
        filters.search = '';
        if (searchInput) searchInput.value = '';
        applyFilters();
      });
    }
    
    if (filters.tag) {
      addFilterTag(`Tag: ${filters.tag}`, () => {
        filters.tag = '';
        if (tagFilter) tagFilter.value = '';
        applyFilters();
      });
    }
  }
  
  // Add a filter tag to the active filters container
  function addFilterTag(text, removeCallback) {
    const tag = document.createElement('span');
    tag.className = 'filter-tag';
    tag.innerHTML = `${text} <i class="fas fa-times"></i>`;
    tag.addEventListener('click', removeCallback);
    activeFiltersContainer.appendChild(tag);
  }
  
  // Apply sorting to visible cards
  function applySorting() {
    const container = cards[0].parentElement;
    const visibleCards = Array.from(cards).filter(card => card.style.display !== 'none');
    
    // Sort cards based on current sort option
    visibleCards.sort((a, b) => {
      if (currentSort === 'newest') {
        const dateA = a.querySelector('.added-date')?.textContent.trim() || '';
        const dateB = b.querySelector('.added-date')?.textContent.trim() || '';
        return dateB.localeCompare(dateA);
      } else if (currentSort === 'oldest') {
        const dateA = a.querySelector('.added-date')?.textContent.trim() || '';
        const dateB = b.querySelector('.added-date')?.textContent.trim() || '';
        return dateA.localeCompare(dateB);
      } else if (currentSort === 'a-z') {
        return (a.getAttribute('data-name') || '').localeCompare(b.getAttribute('data-name') || '');
      } else if (currentSort === 'z-a') {
        return (b.getAttribute('data-name') || '').localeCompare(a.getAttribute('data-name') || '');
      }
      return 0;
    });
    
    // Reorder cards in the DOM
    visibleCards.forEach(card => {
      container.appendChild(card);
    });
  }
  
  // Clear all filters
  function clearAllFilters() {
    filters = {
      search: '',
      tag: ''
    };
    
    if (searchInput) searchInput.value = '';
    if (tagFilter) tagFilter.value = '';
    
    applyFilters();
  }
  
  // Event listeners
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      filters.search = this.value.trim();
      applyFilters();
    });
  }
  
  if (tagFilter) {
    tagFilter.addEventListener('change', function() {
      filters.tag = this.value;
      applyFilters();
    });
  }
  
  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      currentSort = this.value;
      applySorting();
    });
  }
  
  if (clearFiltersButton) {
    clearFiltersButton.addEventListener('click', clearAllFilters);
  }
  
  // Enable tag filtering from card tags
  document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', function() {
      const tagValue = this.getAttribute('data-tag');
      if (tagFilter) {
        tagFilter.value = tagValue;
        filters.tag = tagValue;
        applyFilters();
      }
    });
  });
  
  // Initialize filtering and sorting
  applyFilters();
  
  // Make tags in cards interactive on hover
  document.querySelectorAll('.tag').forEach(tag => {
    tag.title = 'Click to filter by this tag';
  });
});