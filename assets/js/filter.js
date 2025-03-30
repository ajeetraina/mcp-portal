/**
 * MCP Portal Filtering System
 * Handles filtering of MCP servers and tools by search terms, tags, categories, and languages
 */

document.addEventListener('DOMContentLoaded', function() {
  // Get filter elements
  const searchInput = document.getElementById('search-input');
  const tagFilter = document.getElementById('tag-filter');
  const categoryFilter = document.getElementById('category-filter');
  const languageFilter = document.getElementById('language-filter');
  const sortSelect = document.getElementById('sort-select');
  const clearFiltersButton = document.getElementById('clear-filters');
  const activeFiltersContainer = document.querySelector('.active-filters');
  
  // Check if we're on the MCP servers page or tools page
  const isMcpServersPage = document.querySelector('.mcp-grid') !== null;
  const isToolsPage = document.querySelector('.tools-grid') !== null;
  
  // Exit if we're not on a page with filtering
  if (!searchInput || (!isMcpServersPage && !isToolsPage)) {
    return;
  }
  
  // Get all cards depending on the page
  const cards = isMcpServersPage 
    ? document.querySelectorAll('.mcp-card')
    : document.querySelectorAll('.tool-card');
  
  // Initialize filters object
  let filters = {
    search: '',
    tag: '',
    category: '',
    language: '',
    sort: sortSelect ? sortSelect.value : 'newest'
  };
  
  // Initialize tag filter options
  if (tagFilter) {
    initializeTagOptions();
  }
  
  // Apply filters function
  function applyFilters() {
    // Show/hide clear filters button
    if (clearFiltersButton) {
      if (filters.search || filters.tag || filters.category || filters.language) {
        clearFiltersButton.style.display = 'inline-flex';
      } else {
        clearFiltersButton.style.display = 'none';
      }
    }
    
    // Update active filters display
    updateActiveFilters();
    
    // Filter the cards
    filterCards();
    
    // Sort cards
    sortCards();
    
    // Show empty state message if no results
    showEmptyStateIfNeeded();
  }
  
  // Initialize tag options in the tag filter dropdown
  function initializeTagOptions() {
    const tags = new Set();
    
    // Collect all tags from cards
    cards.forEach(card => {
      const cardTags = card.getAttribute('data-tags').split(',');
      cardTags.forEach(tag => {
        if (tag) tags.add(tag.trim());
      });
    });
    
    // Add tag options to select
    tags.forEach(tag => {
      const option = document.createElement('option');
      option.value = tag;
      option.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
      tagFilter.appendChild(option);
    });
  }
  
  // Filter cards based on current filters
  function filterCards() {
    cards.forEach(card => {
      const name = card.getAttribute('data-name').toLowerCase();
      const tags = card.getAttribute('data-tags').toLowerCase();
      const category = card.getAttribute('data-category').toLowerCase();
      const language = card.getAttribute('data-language')?.toLowerCase() || '';
      
      let description = '';
      
      // Get description text if it exists
      const descElement = card.querySelector('.card-description');
      if (descElement) {
        description = descElement.textContent.toLowerCase();
      }
      
      // Check if card matches all filters
      const matchesSearch = !filters.search || 
                           name.includes(filters.search.toLowerCase()) || 
                           tags.includes(filters.search.toLowerCase()) ||
                           description.includes(filters.search.toLowerCase());
                           
      const matchesTag = !filters.tag || tags.split(',').includes(filters.tag.toLowerCase());
      const matchesCategory = !filters.category || category === filters.category.toLowerCase();
      const matchesLanguage = !filters.language || language.includes(filters.language.toLowerCase());
      
      // Show or hide the card based on filters
      if (matchesSearch && matchesTag && matchesCategory && matchesLanguage) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }
  
  // Sort cards based on sort selection
  function sortCards() {
    if (!sortSelect) return;
    
    const container = isMcpServersPage ? document.querySelector('.mcp-grid') : document.querySelector('.tools-grid');
    const cardsArray = Array.from(cards).filter(card => card.style.display !== 'none');
    
    switch (filters.sort) {
      case 'newest':
        cardsArray.sort((a, b) => {
          const dateA = new Date(a.querySelector('.added-date').textContent.trim());
          const dateB = new Date(b.querySelector('.added-date').textContent.trim());
          return dateB - dateA;
        });
        break;
      case 'oldest':
        cardsArray.sort((a, b) => {
          const dateA = new Date(a.querySelector('.added-date').textContent.trim());
          const dateB = new Date(b.querySelector('.added-date').textContent.trim());
          return dateA - dateB;
        });
        break;
      case 'a-z':
        cardsArray.sort((a, b) => {
          const nameA = a.getAttribute('data-name').toLowerCase();
          const nameB = b.getAttribute('data-name').toLowerCase();
          return nameA.localeCompare(nameB);
        });
        break;
      case 'z-a':
        cardsArray.sort((a, b) => {
          const nameA = a.getAttribute('data-name').toLowerCase();
          const nameB = b.getAttribute('data-name').toLowerCase();
          return nameB.localeCompare(nameA);
        });
        break;
      case 'stars':
        if (isToolsPage) {
          cardsArray.sort((a, b) => {
            const starsA = parseInt(a.getAttribute('data-stars') || '0');
            const starsB = parseInt(b.getAttribute('data-stars') || '0');
            return starsB - starsA;
          });
        }
        break;
    }
    
    // Append sorted cards back to container
    cardsArray.forEach(card => {
      container.appendChild(card);
    });
  }
  
  // Update active filters display
  function updateActiveFilters() {
    if (!activeFiltersContainer) return;
    
    activeFiltersContainer.innerHTML = '';
    
    if (filters.search) {
      const filterTag = createFilterTag('Search: ' + filters.search, () => {
        filters.search = '';
        searchInput.value = '';
        applyFilters();
      });
      activeFiltersContainer.appendChild(filterTag);
    }
    
    if (filters.tag) {
      const tagName = tagFilter.options[tagFilter.selectedIndex].text;
      const filterTag = createFilterTag('Tag: ' + tagName, () => {
        filters.tag = '';
        tagFilter.value = '';
        applyFilters();
      });
      activeFiltersContainer.appendChild(filterTag);
    }
    
    if (filters.category && categoryFilter) {
      const categoryName = categoryFilter.options[categoryFilter.selectedIndex].text;
      const filterTag = createFilterTag('Category: ' + categoryName, () => {
        filters.category = '';
        categoryFilter.value = '';
        applyFilters();
      });
      activeFiltersContainer.appendChild(filterTag);
    }
    
    if (filters.language && languageFilter) {
      const languageName = languageFilter.options[languageFilter.selectedIndex].text;
      const filterTag = createFilterTag('Language: ' + languageName, () => {
        filters.language = '';
        languageFilter.value = '';
        applyFilters();
      });
      activeFiltersContainer.appendChild(filterTag);
    }
  }
  
  // Create a filter tag element
  function createFilterTag(text, removeCallback) {
    const tag = document.createElement('span');
    tag.className = 'filter-tag';
    tag.innerHTML = text + ' <i class="fas fa-times"></i>';
    tag.addEventListener('click', removeCallback);
    return tag;
  }
  
  // Show empty state message if no results
  function showEmptyStateIfNeeded() {
    const container = isMcpServersPage ? document.querySelector('.mcp-grid') : document.querySelector('.tools-grid');
    const visibleCards = Array.from(cards).filter(card => card.style.display !== 'none');
    
    // Remove existing empty state message if any
    const existingEmptyState = container.querySelector('.empty-state');
    if (existingEmptyState) {
      container.removeChild(existingEmptyState);
    }
    
    // Show empty state message if no results
    if (visibleCards.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.innerHTML = `
        <i class="fas fa-search"></i>
        <h3>No results found</h3>
        <p>Try adjusting your search or filters</p>
      `;
      container.appendChild(emptyState);
    }
  }
  
  // Add event listeners for filters
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      filters.search = this.value;
      applyFilters();
    });
  }
  
  if (tagFilter) {
    tagFilter.addEventListener('change', function() {
      filters.tag = this.value;
      applyFilters();
    });
  }
  
  if (categoryFilter) {
    categoryFilter.addEventListener('change', function() {
      filters.category = this.value;
      applyFilters();
    });
  }
  
  if (languageFilter) {
    languageFilter.addEventListener('change', function() {
      filters.language = this.value;
      applyFilters();
    });
  }
  
  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      filters.sort = this.value;
      applyFilters();
    });
  }
  
  // Add event listeners for tag clicks
  document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', function() {
      const tagValue = this.getAttribute('data-tag');
      filters.tag = tagValue;
      if (tagFilter) tagFilter.value = tagValue;
      applyFilters();
    });
  });
  
  // Clear all filters
  if (clearFiltersButton) {
    clearFiltersButton.addEventListener('click', function() {
      filters = {
        search: '',
        tag: '',
        category: '',
        language: '',
        sort: sortSelect ? sortSelect.value : 'newest'
      };
      
      if (searchInput) searchInput.value = '';
      if (tagFilter) tagFilter.value = '';
      if (categoryFilter) categoryFilter.value = '';
      if (languageFilter) languageFilter.value = '';
      
      applyFilters();
    });
  }
  
  // Initialize the filters on page load
  applyFilters();
});