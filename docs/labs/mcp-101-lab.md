---
layout: lab
title: Lab 1 - First Steps with Docker & MCP Servers
description: In this beginner-friendly hands-on lab, you'll set up your first MCP servers with Docker and learn to interact with them using Gordon AI.
difficulty: Beginner
time: 30 minutes
author: Docker Team
last_updated: March 18, 2025
next_lab: /docs/labs/research-assistant-lab
---

<div class="lab-prerequisites">
  <h2><i class="fas fa-clipboard-list"></i> Prerequisites</h2>
  <ul>
    <li>Docker Desktop installed</li>
    <li>Basic command line knowledge</li>
  </ul>
</div>

<div class="learning-objectives">
  <h2><i class="fas fa-graduation-cap"></i> Learning Objectives</h2>
  <ol>
    <li>Set up multiple MCP servers using Docker Compose</li>
    <li>Configure proper filesystem mounts and permissions</li>
    <li>Interact with MCP servers using Gordon AI</li>
    <li>Understand how MCP servers communicate with AI assistants</li>
  </ol>
</div>

<div class="lab-step">
  <div class="lab-step-header">
    <i class="fas fa-play-circle"></i> Step 1: Create Your Lab Environment
  </div>
  <div class="lab-step-content">
    <p>First, create a new directory for your lab:</p>

```bash
mkdir mcp-lab1
cd mcp-lab1
```

    <p>Create a new file called <code>data.txt</code> with some sample content:</p>

```bash
echo "This is sample text for our MCP lab experiment. The Docker MCP integration is awesome!" > data.txt
```
  </div>
</div>

<div class="lab-step">
  <div class="lab-step-header">
    <i class="fas fa-server"></i> Step 2: Set Up Your First MCP Servers
  </div>
  <div class="lab-step-content">
    <p>Create a file named <code>gordon-mcp.yml</code> with the following content:</p>

```yaml
services:
  time:
    image: mcp/time
    container_name: mcp-time
  
  fs:
    image: mcp/filesystem
    container_name: mcp-filesystem
    command:
      - /rootfs
    volumes:
      - .:/rootfs
```

    <p>This configuration sets up two MCP servers:</p>
    <ul>
      <li>A time server that provides date and time information</li>
      <li>A filesystem server that gives access to the current directory</li>
    </ul>
  </div>
</div>

<div class="lab-step">
  <div class="lab-step-header">
    <i class="fas fa-robot"></i> Step 3: Interact with Your MCP Servers
  </div>
  <div class="lab-step-content">
    <p>Now let's test our setup with some questions for Gordon AI:</p>

```bash
# Ask a time-related question
docker ai "What time is it now in New York, Tokyo, and London? Show the date too."

# Ask a question that requires filesystem access
docker ai "What's in the data.txt file? Count the words and tell me how many there are."
```

    <p>You should see Gordon AI accessing the appropriate MCP servers to answer your questions.</p>

    <div class="lab-tip">
      <h4><i class="fas fa-lightbulb"></i> Tip</h4>
      <p>If you don't see any indication that Gordon is using the MCP servers, verify that your <code>gordon-mcp.yml</code> file is in the current directory and that Docker Desktop is running.</p>
    </div>
  </div>
</div>

<div class="lab-step">
  <div class="lab-step-header">
    <i class="fas fa-plus-circle"></i> Step 4: Extend Your MCP Configuration
  </div>
  <div class="lab-step-content">
    <p>Let's add another MCP server to our setup. Update your <code>gordon-mcp.yml</code> file:</p>

```yaml
services:
  time:
    image: mcp/time
    container_name: mcp-time
  
  fs:
    image: mcp/filesystem
    container_name: mcp-filesystem
    command:
      - /rootfs
    volumes:
      - .:/rootfs
  
  fetch:
    image: mcp/fetch
    container_name: mcp-fetch
```

    <p>Now you can ask Gordon AI to fetch web content:</p>

```bash
docker ai "Fetch the Docker homepage and write a brief summary of what Docker is to a file called docker-summary.txt"
```
  </div>
</div>

<div class="lab-step">
  <div class="lab-step-header">
    <i class="fas fa-search"></i> Step 5: Examine Container Operations
  </div>
  <div class="lab-step-content">
    <p>While Gordon is handling your requests, you can observe how Docker manages these MCP servers:</p>

```bash
# List running containers
docker ps

# View logs from a specific MCP server
docker logs mcp-fetch
```

    <p>Notice how containers are created and managed as needed for each interaction.</p>
  </div>
</div>

<div class="lab-note">
  <h4><i class="fas fa-info-circle"></i> Understanding What's Happening</h4>
  <p>When you run <code>docker ai</code> with your <code>gordon-mcp.yml</code> configuration:</p>
  <ol>
    <li>Gordon checks the <code>gordon-mcp.yml</code> file to discover available MCP servers</li>
    <li>When needed, Gordon starts the required MCP server containers</li>
    <li>Gordon sends requests to the appropriate MCP servers based on your query</li>
    <li>MCP servers process the requests and return results to Gordon</li>
    <li>Gordon uses this context to formulate a comprehensive response</li>
  </ol>
</div>

<div class="lab-step">
  <div class="lab-step-header">
    <i class="fas fa-flask"></i> Experiment on Your Own
  </div>
  <div class="lab-step-content">
    <p>Try these additional exercises:</p>
    <ol>
      <li>Create a more complex file structure and ask Gordon to navigate and summarize it</li>
      <li>Ask Gordon to combine information from multiple sources (time + web content)</li>
      <li>Try modifying the filesystem mount to restrict access to only certain directories</li>
    </ol>
    
    <div class="lab-tip">
      <h4><i class="fas fa-lightbulb"></i> Challenge</h4>
      <p>Create a new directory structure with some sample data files and ask Gordon to perform data analysis tasks on them. See if you can have Gordon generate a report combining the filesystem data with current time information.</p>
    </div>
  </div>
</div>

<div class="lab-note">
  <h4><i class="fas fa-exclamation-triangle"></i> Troubleshooting</h4>
  <p>If you encounter issues:</p>
  <ul>
    <li>Ensure Docker is running properly</li>
    <li>Check that your <code>gordon-mcp.yml</code> file is in the current directory</li>
    <li>Verify the syntax of your YAML file</li>
    <li>Try restarting Docker Desktop if containers won't start</li>
  </ul>
</div>

<div class="lab-conclusion">
  <h2><i class="fas fa-flag-checkered"></i> Conclusion</h2>
  <p>Congratulations! You've successfully set up your first MCP servers and learned how Gordon AI interacts with them. You've seen how Docker containers provide a secure and isolated environment for MCP servers, and how multiple servers can work together to enhance AI capabilities.</p>
  <p>This foundational knowledge will be essential as you move on to more complex MCP configurations and use cases.</p>
</div>

<div class="next-steps">
  <h2><i class="fas fa-arrow-circle-right"></i> Next Steps</h2>
  <p>Now that you've completed your first MCP lab, you can continue your learning journey with:</p>
  <ul>
    <li><a href="/docs/labs/research-assistant-lab">Lab 2: Building a Research Assistant with MCP</a> - Learn how to create a powerful research assistant using multiple MCP servers</li>
    <li><a href="/docs/labs/database-operations-lab">Lab 3: Database Operations with MCP Servers</a> - Explore how to use MCP servers for database interactions</li>
  </ul>
</div>
