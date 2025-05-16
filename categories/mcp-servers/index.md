---
layout: category
title: MCP Servers
description: Explore Docker's container images for MCP servers
category: mcp-servers
---

# MCP Servers

MCP servers are containerized applications that implement the Model Context Protocol, enabling AI assistants like Claude to access external tools and services. Docker has partnered with Anthropic to build and maintain container images for MCP servers, available on Docker Hub under the `mcp/` namespace.

## Available MCP Servers

Below you'll find a list of MCP servers available on Docker Hub:

<div class="mcp-grid">
  {% if site.data.mcp_servers.working_servers %}
    {% for server in site.data.mcp_servers.working_servers %}
      <div class="mcp-card">
        <div class="card-header">
          <h3 class="card-title">{{ server.name }}</h3>
          <div class="card-meta">
            <span class="server-status success">Working</span>
          </div>
        </div>
        
        <div class="card-body">
          <div class="card-icon">
            <i class="fab fa-docker"></i>
          </div>
          <p class="card-description">{{ server.description }}</p>
        </div>
        
        <div class="card-footer">
          <div class="card-links">
            <a href="https://hub.docker.com/r/{{ server.image }}" class="btn btn-docker" target="_blank" rel="noopener">
              <i class="fab fa-docker"></i> Docker Hub
            </a>
          </div>
          
          <div class="card-copy">
            <button class="btn btn-copy" data-clipboard-text="docker pull {{ server.image }}" title="Copy Docker pull command">
              <i class="fas fa-copy"></i> Copy
            </button>
          </div>
        </div>
      </div>
    {% endfor %}
  {% endif %}
</div>

## Benefits of Containerized MCP Servers

Using Docker containers for MCP servers offers several advantages:

1. **Isolation and Security**: Each MCP server runs in its own container, providing proper isolation and security.
2. **Easy Deployment**: Docker makes it simple to deploy MCP servers in any environment that supports containers.
3. **Configuration Flexibility**: Configure MCP servers through environment variables, bind mounts, and other Docker features.
4. **Resource Management**: Control the resources allocated to each MCP server.
5. **Scalability**: Scale MCP servers up or down based on demand.

## Getting Started with MCP Servers

To use MCP servers with Docker, you can follow these steps:

1. Pull the desired MCP server image from Docker Hub:
   ```bash
   docker pull mcp/time
   ```

2. Create a `docker-compose.yml` file to configure multiple MCP servers:
   ```yaml
   services:
     time:
       image: mcp/time
     fetch:
       image: mcp/fetch
     fs:
       image: mcp/filesystem
       command:
         - /rootfs
       volumes:
         - .:/rootfs
   ```

3. Run the containers:
   ```bash
   docker-compose up -d
   ```

4. Connect your AI assistant to the MCP servers according to your application's requirements.

## Using MCP Servers with Claude

When integrating MCP servers with Claude, you'll need to:

1. Configure the appropriate environment variables for authentication
2. Specify the tools you want Claude to have access to
3. Ensure proper connection between Claude and the MCP servers

For detailed instructions, visit the [Getting Started](/categories/getting-started/) section.

## Contributing

If you've developed a new MCP server that you'd like to share with the community, we welcome your contributions! 

Check out the [Contributing Guidelines](https://github.com/ajeetraina/mcp-portal/blob/main/CONTRIBUTING.md) for information on how to submit your MCP server to this collection.

<style>
/* MCP Server Grid Styles */
.mcp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.mcp-card {
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-top: 4px solid var(--color-primary);
}

.mcp-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-hover);
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-gray);
}

.card-title {
  font-size: 1.35rem;
  margin-bottom: 0.75rem;
  color: var(--color-secondary);
  font-weight: 600;
}

.card-meta {
  display: flex;
  font-size: 0.85rem;
  color: #777;
  align-items: center;
}

.server-status {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 600;
}

.server-status.success {
  background-color: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.card-body {
  padding: 1.5rem;
  flex-grow: 1;
}

.card-icon {
  float: right;
  margin: 0 0 1rem 1rem;
  font-size: 2.5rem;
  color: rgba(13, 183, 237, 0.15);
}

.card-description {
  margin-bottom: 1rem;
  font-size: 0.95rem;
  line-height: 1.7;
  color: #555;
}

.card-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--color-gray);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--color-secondary-light);
}

.btn-docker {
  background-color: var(--color-primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  font-size: 0.9rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s ease;
}

.btn-docker:hover {
  background-color: var(--color-primary-dark);
  color: white;
}

.btn-copy {
  background-color: transparent;
  color: var(--color-secondary);
  border: 1px solid var(--color-gray);
  padding: 0.5rem 0.8rem;
  border-radius: var(--border-radius);
  font-size: 0.9rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.btn-copy:hover {
  background-color: var(--color-secondary);
  color: white;
  border-color: var(--color-secondary);
}

@media (max-width: 768px) {
  .mcp-grid {
    grid-template-columns: 1fr;
  }
  
  .card-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .card-links {
    order: 2;
    width: 100%;
  }
  
  .card-copy {
    order: 1;
    align-self: flex-end;
  }
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
  var clipboard = new ClipboardJS('.btn-copy');
  
  clipboard.on('success', function(e) {
    var button = e.trigger;
    var originalText = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-check"></i> Copied!';
    button.classList.add('copied');
    
    setTimeout(function() {
      button.innerHTML = originalText;
      button.classList.remove('copied');
    }, 2000);
    
    e.clearSelection();
  });
});
</script>