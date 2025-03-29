---
layout: page
title: MCP Servers Reddit Feed
description: Latest discussions and announcements about MCP servers from Reddit
permalink: /mcp-servers-reddit/
---

<link rel="stylesheet" href="{{ '/assets/css/reddit-feed.css' | relative_url }}">

# MCP Servers Reddit Feed

Stay updated with the latest discussions, announcements, and community projects related to Model Context Protocol servers. This page automatically fetches content from relevant subreddits to keep you informed about new MCP servers and developments.

<div class="reddit-feed-container">
  <!-- Filter controls -->
  <div class="feed-controls">
    <div class="subreddit-filter">
      <h3>Filter by Subreddit</h3>
      <div id="subreddit-buttons">
        <button class="filter-btn active" data-subreddit="all">All Sources</button>
        <button class="filter-btn" data-subreddit="docker">r/docker</button>
        <button class="filter-btn" data-subreddit="machinelearning">r/machinelearning</button>
        <button class="filter-btn" data-subreddit="artificial">r/artificial</button>
        <button class="filter-btn" data-subreddit="programming">r/programming</button>
      </div>
    </div>
    
    <div class="search-filter">
      <h3>Filter by Keyword</h3>
      <div class="search-container">
        <input type="text" id="keyword-filter" placeholder="Enter keywords (e.g., PostgreSQL, filesystem)">
        <button id="search-btn"><i class="fas fa-search"></i></button>
      </div>
      <div class="keyword-tags" id="keyword-tags">
        <!-- Keyword tags will be added here dynamically -->
      </div>
    </div>
    
    <div class="refresh-control">
      <button id="refresh-btn" class="refresh-btn"><i class="fas fa-sync-alt"></i> Refresh Feed</button>
      <div class="last-updated">Last updated: <span id="update-time">Loading...</span></div>
    </div>
  </div>

  <!-- Reddit feed content area -->
  <div class="feed-content">
    <div class="feed-header">
      <h2>Latest MCP Server Discussions <span id="filtered-indicator"></span></h2>
    </div>
    
    <div id="loading-indicator" class="loading-indicator">
      <div class="spinner"></div>
      <p>Fetching the latest posts from Reddit...</p>
    </div>
    
    <div id="reddit-posts" class="reddit-posts">
      <!-- Posts will be loaded here -->
    </div>
    
    <div id="no-results" class="no-results hidden">
      <i class="fas fa-search"></i>
      <p>No posts found matching your filters.</p>
      <button id="clear-filters-btn">Clear All Filters</button>
    </div>
  </div>
</div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const subreddits = ['docker', 'machinelearning', 'artificial', 'programming'];
    const keywordsList = ['mcp', 'model context protocol', 'docker mcp', 'mcp server', 
                        'postgresql mcp', 'filesystem mcp', 'time mcp', 'claude mcp', 
                        'anthropic mcp', 'ai assistant', 'ai context'];
    let activeSubreddit = 'all';
    let activeKeywords = [];
    let allPosts = [];
    
    // DOM elements
    const redditPostsContainer = document.getElementById('reddit-posts');
    const loadingIndicator = document.getElementById('loading-indicator');
    const noResults = document.getElementById('no-results');
    const updateTimeSpan = document.getElementById('update-time');
    const filteredIndicator = document.getElementById('filtered-indicator');
    const keywordFilter = document.getElementById('keyword-filter');
    const searchBtn = document.getElementById('search-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const keywordTagsContainer = document.getElementById('keyword-tags');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    
    // Initialize the feed
    initializeSubredditButtons();
    fetchAllSubreddits();
    
    // Set up event listeners
    refreshBtn.addEventListener('click', fetchAllSubreddits);
    clearFiltersBtn.addEventListener('click', clearAllFilters);
    keywordFilter.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        addKeywordFilter(keywordFilter.value.trim());
      }
    });
    searchBtn.addEventListener('click', function() {
      addKeywordFilter(keywordFilter.value.trim());
    });
    
    // Functions
    function initializeSubredditButtons() {
      const buttons = document.querySelectorAll('.filter-btn');
      buttons.forEach(button => {
        button.addEventListener('click', function() {
          buttons.forEach(btn => btn.classList.remove('active'));
          this.classList.add('active');
          activeSubreddit = this.dataset.subreddit;
          filterAndDisplayPosts();
          updateFilterIndicator();
        });
      });
    }
    
    function fetchAllSubreddits() {
      showLoading(true);
      allPosts = [];
      let fetchedCount = 0;
      
      subreddits.forEach(subreddit => {
        fetchSubreddit(subreddit).then(posts => {
          allPosts = allPosts.concat(posts);
          fetchedCount++;
          
          if (fetchedCount === subreddits.length) {
            // All subreddits fetched
            allPosts.sort((a, b) => new Date(b.created_utc * 1000) - new Date(a.created_utc * 1000));
            filterAndDisplayPosts();
            updateTimeSpan.textContent = new Date().toLocaleString();
            showLoading(false);
          }
        }).catch(error => {
          console.error(`Error fetching r/${subreddit}:`, error);
          fetchedCount++;
          
          if (fetchedCount === subreddits.length) {
            // All attempts completed
            filterAndDisplayPosts();
            updateTimeSpan.textContent = new Date().toLocaleString();
            showLoading(false);
          }
        });
      });
    }
    
    async function fetchSubreddit(subreddit) {
      // Use a CORS proxy to fetch the subreddit JSON
      const corsProxy = 'https://corsproxy.io/?';
      const url = `${corsProxy}https://www.reddit.com/r/${subreddit}/search.json?q=mcp%20OR%20%22model%20context%20protocol%22&restrict_sr=1&sort=new&limit=25`;
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Extract relevant post data
        return data.data.children.map(child => {
          const post = child.data;
          return {
            title: post.title,
            author: post.author,
            created_utc: post.created_utc,
            url: `https://www.reddit.com${post.permalink}`,
            thumbnail: post.thumbnail && post.thumbnail.startsWith('http') ? post.thumbnail : null,
            subreddit: post.subreddit,
            score: post.score,
            num_comments: post.num_comments,
            selftext: post.selftext
          };
        });
      } catch (error) {
        console.error(`Error fetching r/${subreddit}:`, error);
        return [];
      }
    }
    
    function filterAndDisplayPosts() {
      // Filter posts based on active filters
      let filteredPosts = allPosts.filter(post => {
        // Filter by subreddit
        if (activeSubreddit !== 'all' && post.subreddit.toLowerCase() !== activeSubreddit.toLowerCase()) {
          return false;
        }
        
        // Filter by keywords
        if (activeKeywords.length > 0) {
          const postText = `${post.title} ${post.selftext}`.toLowerCase();
          return activeKeywords.some(keyword => postText.includes(keyword.toLowerCase()));
        }
        
        return true;
      });
      
      // Display results or no results message
      if (filteredPosts.length === 0) {
        redditPostsContainer.innerHTML = '';
        noResults.classList.remove('hidden');
      } else {
        noResults.classList.add('hidden');
        displayPosts(filteredPosts);
      }
      
      updateFilterIndicator();
    }
    
    function displayPosts(posts) {
      redditPostsContainer.innerHTML = '';
      
      posts.forEach(post => {
        const postDate = new Date(post.created_utc * 1000).toLocaleString();
        const hasThumbnail = post.thumbnail && post.thumbnail !== 'self' && post.thumbnail !== 'default';
        
        const postElement = document.createElement('div');
        postElement.className = 'reddit-post';
        
        let postHTML = `
          <div class="post-header">
            <span class="post-subreddit">r/${post.subreddit}</span>
            <span class="post-date">${postDate}</span>
          </div>
          <h3 class="post-title"><a href="${post.url}" target="_blank">${post.title}</a></h3>
          <div class="post-author">Posted by u/${post.author}</div>
        `;
        
        if (hasThumbnail) {
          postHTML += `
            <div class="post-content-with-thumbnail">
              <div class="post-thumbnail">
                <img src="${post.thumbnail}" alt="Post thumbnail">
              </div>
              <div class="post-text">
                ${post.selftext ? `<p>${truncateText(post.selftext, 250)}</p>` : ''}
              </div>
            </div>
          `;
        } else if (post.selftext) {
          postHTML += `
            <div class="post-content">
              <p>${truncateText(post.selftext, 350)}</p>
            </div>
          `;
        }
        
        postHTML += `
          <div class="post-footer">
            <span class="post-score"><i class="fas fa-arrow-up"></i> ${post.score}</span>
            <span class="post-comments"><i class="fas fa-comment"></i> ${post.num_comments} comments</span>
            <a href="${post.url}" target="_blank" class="post-link">View on Reddit <i class="fas fa-external-link-alt"></i></a>
          </div>
        `;
        
        postElement.innerHTML = postHTML;
        redditPostsContainer.appendChild(postElement);
      });
    }
    
    function truncateText(text, maxLength) {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    }
    
    function addKeywordFilter(keyword) {
      if (!keyword) return;
      
      // Add to active keywords if not already present
      if (!activeKeywords.includes(keyword)) {
        activeKeywords.push(keyword);
        
        // Add keyword tag
        const tag = document.createElement('div');
        tag.className = 'keyword-tag';
        tag.innerHTML = `
          <span>${keyword}</span>
          <button class="remove-tag" data-keyword="${keyword}"><i class="fas fa-times"></i></button>
        `;
        keywordTagsContainer.appendChild(tag);
        
        // Add remove event listener
        tag.querySelector('.remove-tag').addEventListener('click', function() {
          removeKeywordFilter(this.dataset.keyword);
        });
        
        // Clear input
        keywordFilter.value = '';
        
        // Apply filter
        filterAndDisplayPosts();
      }
    }
    
    function removeKeywordFilter(keyword) {
      // Remove from active keywords
      const index = activeKeywords.indexOf(keyword);
      if (index > -1) {
        activeKeywords.splice(index, 1);
      }
      
      // Remove tag element
      const tags = keywordTagsContainer.querySelectorAll('.keyword-tag');
      tags.forEach(tag => {
        if (tag.querySelector('.remove-tag').dataset.keyword === keyword) {
          tag.remove();
        }
      });
      
      // Apply filter
      filterAndDisplayPosts();
    }
    
    function clearAllFilters() {
      // Reset to default state
      activeKeywords = [];
      keywordTagsContainer.innerHTML = '';
      keywordFilter.value = '';
      
      // Reset subreddit filter to 'all'
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.subreddit === 'all') {
          btn.classList.add('active');
        }
      });
      activeSubreddit = 'all';
      
      // Apply filters
      filterAndDisplayPosts();
    }
    
    function updateFilterIndicator() {
      if (activeSubreddit !== 'all' || activeKeywords.length > 0) {
        let filterText = '';
        
        if (activeSubreddit !== 'all') {
          filterText += `in r/${activeSubreddit}`;
        }
        
        if (activeKeywords.length > 0) {
          if (filterText) filterText += ' ';
          filterText += `matching [${activeKeywords.join(', ')}]`;
        }
        
        filteredIndicator.textContent = `(${filterText})`;
      } else {
        filteredIndicator.textContent = '';
      }
    }
    
    function showLoading(isLoading) {
      if (isLoading) {
        loadingIndicator.classList.remove('hidden');
        redditPostsContainer.innerHTML = '';
        noResults.classList.add('hidden');
      } else {
        loadingIndicator.classList.add('hidden');
      }
    }
  });
</script>