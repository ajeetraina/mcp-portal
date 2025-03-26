---
layout: page
title: MCP Labs & Tutorials
---

# MCP Labs & Tutorials

Welcome to our collection of hands-on labs and tutorials for Docker Model Context Protocol (MCP). Whether you're just getting started with MCP or looking to deploy production-ready solutions, we have resources to help you succeed.

## Getting Started Resources

Before diving into the labs, you might want to familiarize yourself with these resources:

- [Getting Started with Docker & MCP](/docs/getting-started)
- [Ask Gordon - Docker's CLI AI Assistant](/docs/ask-gordon)

## Hands-on Labs

Our progressive labs will take you from the basics to advanced MCP implementations:

<div class="lab-grid">
  <div class="lab-card beginner">
    <div class="lab-header">
      <span class="lab-level">Beginner</span>
      <span class="lab-time">30 min</span>
    </div>
    <h3>Lab 1: First Steps with Docker & MCP Servers</h3>
    <p>Set up your first MCP servers with Docker and learn to interact with them using Gordon AI.</p>
    <a href="/docs/labs/mcp-101-lab" class="lab-button">Start Lab ➜</a>
  </div>
  
  <div class="lab-card intermediate">
    <div class="lab-header">
      <span class="lab-level">Intermediate</span>
      <span class="lab-time">45-60 min</span>
    </div>
    <h3>Lab 2: Building a Research Assistant with Docker MCP</h3>
    <p>Create a powerful research assistant by configuring multiple Docker MCP servers working together.</p>
    <a href="/docs/labs/research-assistant-lab" class="lab-button">Start Lab ➜</a>
  </div>
  
  <div class="lab-card intermediate">
    <div class="lab-header">
      <span class="lab-level">Intermediate</span>
      <span class="lab-time">60 min</span>
    </div>
    <h3>Lab 3: Database Operations with MCP Servers</h3>
    <p>Learn how to use Docker MCP servers to interact with databases and perform various database operations.</p>
    <a href="/docs/labs/database-operations-lab" class="lab-button">Start Lab ➜</a>
  </div>
  
  <div class="lab-card advanced">
    <div class="lab-header">
      <span class="lab-level">Advanced</span>
      <span class="lab-time">90 min</span>
    </div>
    <h3>Lab 4: Deploying MCP Servers to Production</h3>
    <p>Deploy Docker MCP servers to a production environment with proper security, monitoring, and scaling.</p>
    <a href="/docs/labs/production-deployment-lab" class="lab-button">Start Lab ➜</a>
  </div>
</div>

## In-Depth Tutorials

Our tutorials provide detailed guidance on specific MCP topics:

<div class="tutorial-grid">
  <div class="tutorial-card advanced">
    <div class="tutorial-header">
      <span class="tutorial-level">Advanced</span>
      <span class="tutorial-time">90-120 min</span>
    </div>
    <h3>Building Custom MCP Servers</h3>
    <p>Learn to create your own custom Model Context Protocol (MCP) server and package it as a Docker container.</p>
    <a href="/docs/tutorials/custom-mcp-server" class="tutorial-button">View Tutorial ➜</a>
  </div>
</div>

## Recommended Learning Path

For the best learning experience, we recommend following this sequence:

1. Complete [Lab 1: First Steps with Docker & MCP Servers](/docs/labs/mcp-101-lab)
2. Then try [Lab 2: Building a Research Assistant](/docs/labs/research-assistant-lab)
3. Move on to [Lab 3: Database Operations](/docs/labs/database-operations-lab)
4. Learn how to build [Custom MCP Servers](/docs/tutorials/custom-mcp-server)
5. Finally, master [Production Deployment](/docs/labs/production-deployment-lab)

## Community Resources

Check out these community resources to enhance your MCP journey:

- [Docker & MCP Servers Catalog](/servers-table)
- [MCP Tools](/tools-table)
- [MCP Community Forum](https://forums.docker.com/c/docker-mcp/)

## Contributing New Labs

Want to contribute a new lab or tutorial? Check out our [contribution guidelines](https://github.com/ajeetraina/docker-mcp-portal/blob/main/CONTRIBUTING.md) and submit a pull request!

<style>
.lab-grid, .tutorial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.lab-card, .tutorial-card {
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.lab-card:hover, .tutorial-card:hover {
  transform: translateY(-5px);
}

.lab-card.beginner {
  border-top: 4px solid #4caf50;
}

.lab-card.intermediate {
  border-top: 4px solid #2196f3;
}

.lab-card.advanced, .tutorial-card.advanced {
  border-top: 4px solid #f44336;
}

.lab-header, .tutorial-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.lab-level, .tutorial-level {
  font-weight: bold;
  font-size: 0.9em;
}

.lab-time, .tutorial-time {
  font-size: 0.9em;
  color: #666;
}

.lab-button, .tutorial-button {
  display: inline-block;
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #0db7ed;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.lab-button:hover, .tutorial-button:hover {
  background-color: #0997c4;
}

.lab-card h3, .tutorial-card h3 {
  margin-top: 10px;
  margin-bottom: 10px;
}

.lab-card p, .tutorial-card p {
  color: #555;
  margin-bottom: 15px;
  line-height: 1.4;
}
</style>

## Upcoming Labs & Tutorials

We're constantly working on new content. Here's what's coming soon:

- **Tutorial: MCP Authentication and Security** - Learn how to implement proper authentication for your MCP servers
- **Lab: Integrating MCP with Kubernetes** - Deploy scalable MCP servers on Kubernetes
- **Tutorial: Building AI-powered DevOps Workflows** - Create advanced CI/CD pipelines with MCP and Gordon

If you have ideas for new labs or tutorials, please [open an issue](https://github.com/ajeetraina/docker-mcp-portal/issues/new) with your suggestion!
