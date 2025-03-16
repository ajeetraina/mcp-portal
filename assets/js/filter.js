document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const searchInput = document.getElementById('search-input');
  const tagSelect = document.getElementById('tag-filter');
  const sortSelect = document.getElementById('sort-select');
  const mcpGrid = document.querySelector('.mcp-grid');
  const mcpCards = document.querySelectorAll('.mcp-card');
  const activeFiltersContainer = document.querySelector('.active-filters');
  const clearFiltersBtn = document.getElementById('clear-filters');
  const copyButtons = document.querySelectorAll('.btn-copy');
  
  // State
  let activeFilters = {
    search: '',
    tags: [],
    sort: 'newest'
  };
  
  // Initialize tag filter options
  if (tagSelect) {
    const allTags = new Set();
    
    // Collect all available tags
    mcpCards.forEach(card => {
      const tags = card.getAttribute('data-tags').split(',');
      tags.forEach(tag => allTags.add(tag.trim()));
    });
    
    // Add tag options to select
    Array.from(allTags).sort().forEach(tag => {
      if (tag) {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
        tagSelect.appendChild(option);
      }
    });
  }
  
  // Apply filters and sorting
  function applyFilters() {
    mcpCards.forEach(card => {
      const cardName = card.getAttribute('data-name');
      const cardTags = card.getAttribute('data-tags').split(',');
      
      // Default to visible
      let isVisible = true;
      
      // Apply search filter
      if (activeFilters.search) {
        isVisible = cardName.includes(activeFilters.search.toLowerCase());
      }
      
      // Apply tag filters
      if (isVisible && activeFilters.tags.length > 0) {
        isVisible = activeFilters.tags.every(tag => 
          cardTags.includes(tag.toLowerCase())
        );
      }
      
      // Show/hide card
      card.style.display = isVisible ? 'flex' : 'none';
    });
    
    // Update active filters display
    updateActiveFilters();
  }
  
  // Apply sorting
  function applySorting() {
    const sortValue = activeFilters.sort;
    const cardsArray = Array.from(mcpCards);
    
    const sortedCards = cardsArray.sort((a, b) => {
      if (sortValue === 'newest') {
        const dateA = a.querySelector('.added-date').getAttribute('title');
        const dateB = b.querySelector('.added-date').getAttribute('title');
        return new Date(dateB) - new Date(dateA);
      } else if (sortValue === 'oldest') {
        const dateA = a.querySelector('.added-date').getAttribute('title');
        const dateB = b.querySelector('.added-date').getAttribute('title');
        return new Date(dateA) - new Date(dateB);
      } else if (sortValue === 'a-z') {
        const nameA = a.getAttribute('data-name');
        const nameB = b.getAttribute('data-name');
        return nameA.localeCompare(nameB);
      } else if (sortValue === 'z-a') {
        const nameA = a.getAttribute('data-name');
        const nameB = b.getAttribute('data-name');
        return nameB.localeCompare(nameA);
      }
      return 0;
    });
    
    // Reorder elements in the DOM
    sortedCards.forEach(card => {
      mcpGrid.appendChild(card);
    });
  }
  
  // Update active filters display
  function updateActiveFilters() {
    if (!activeFiltersContainer) return;
    
    // Clear container
    activeFiltersContainer.innerHTML = '';
    
    // Add search filter
    if (activeFilters.search) {
      const filterEl = document.createElement('div');
      filterEl.className = 'active-filter';
      filterEl.innerHTML = `
        Search: ${activeFilters.search}
        <span class="filter-remove" data-type="search">×</span>
      `;
      activeFiltersContainer.appendChild(filterEl);
    }
    
    // Add tag filters
    activeFilters.tags.forEach(tag => {
      const filterEl = document.createElement('div');
      filterEl.className = 'active-filter';
      filterEl.innerHTML = `
        Tag: ${tag}
        <span class="filter-remove" data-type="tag" data-value="${tag}">×</span>
      `;
      activeFiltersContainer.appendChild(filterEl);
    });
    
    // Show/hide clear all button
    if (clearFiltersBtn) {
      clearFiltersBtn.style.display = 
        activeFilters.search || activeFilters.tags.length > 0 
          ? 'inline-flex' 
          : 'none';
    }
  }
  
  // Event handlers
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      activeFilters.search = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }
  
  if (tagSelect) {
    tagSelect.addEventListener('change', function(e) {
      const selectedTag = e.target.value;
      if (selectedTag && !activeFilters.tags.includes(selectedTag)) {
        activeFilters.tags.push(selectedTag);
        applyFilters();
        e.target.value = ''; // Reset select
      }
    });
  }
  
  if (sortSelect) {
    sortSelect.addEventListener('change', function(e) {
      activeFilters.sort = e.target.value;
      applySorting();
    });
  }
  
  // Handle click on active filters (to remove)
  if (activeFiltersContainer) {
    activeFiltersContainer.addEventListener('click', function(e) {
      if (e.target.classList.contains('filter-remove')) {
        const type = e.target.getAttribute('data-type');
        
        if (type === 'search') {
          activeFilters.search = '';
          if (searchInput) searchInput.value = '';
        } else if (type === 'tag') {
          const value = e.target.getAttribute('data-value');
          activeFilters.tags = activeFilters.tags.filter(tag => tag !== value);
        }
        
        applyFilters();
      }
    });
  }
  
  // Clear all filters
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', function() {
      activeFilters.search = '';
      activeFilters.tags = [];
      if (searchInput) searchInput.value = '';
      applyFilters();
    });
  }
  
  // Copy to clipboard functionality
  if (copyButtons.length > 0) {
    copyButtons.forEach(button => {
      button.addEventListener('click', function() {
        const textToCopy = this.getAttribute('data-clipboard-text');
        
        navigator.clipboard.writeText(textToCopy).then(() => {
          // Show success feedback
          const originalText = this.innerHTML;
          this.innerHTML = '<i class="fas fa-check"></i>';
          
          setTimeout(() => {
            this.innerHTML = originalText;
          }, 2000);
        }).catch(err => {
          console.error('Failed to copy: ', err);
        });
      });
    });
  }
  
  // Initial sort
  applySorting();
});