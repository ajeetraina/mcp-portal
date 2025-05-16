---
layout: post
title: "GitHub MCP Server, Docker, and Claude Desktop"
date: 2025-04-09
author: Ajeet Singh Raina
categories: [tutorials, mcp, github]
image: /assets/images/github-mcp-server.png
featured: true
---

In today's fast-paced dynamic development landscape, managing repositories and performing file operations on GitHub can often become a tedious chore. What if you could automate and simplify these tasks with just a single tool? This brings us to GitHub MCP Server.

## What is GitHub MCP Server?

Model Context Protocol (MCP) is an open protocol that standardizes how applications provide context to LLMs. Think of MCP like a USB-C port for AI applications. Just as USB-C provides a standardized way to connect your devices to various peripherals and accessories, MCP provides a standardized way to connect AI models to different data sources and tools.

GitHub MCP Server is an innovative server designed to handle file operations, repository management, advanced search, and much more via the GitHub API. In this blog post, we'll walk you through what GitHub MCP Server offers, demonstrate a simple use case, and show you how to get started with a live demo.

## Key Features and Tools

Here's a quick look at some of the powerful operations MCP Server supports:

- **File Operations**: 
  - `create_or_update_file`: Create or update a single file in a repository
  - `push_files_content`: Push multiple files (using direct content) in a single commit
  - `push_files_from_path`: Push files from filesystem paths

- **Advanced Search Capabilities**:
  - `search_repositories`
  - `search_code`
  - `search_issues`
  - `search_users`

- **Repository Operations**: Create issues, pull requests, branch creation, and more

For example, the `create_or_update_file` function accepts inputs such as repository owner, repository name, file path, content, commit message, and branch name, and returns details about the file and the commit. This ensures you have full control over your Git operations without manually managing Git commands.

## A Quick Demo: Running GitHub MCP Server

### Pre-requisites

- Docker Desktop
- GitHub Account
- Claude Desktop

### Step 1: Install Docker Desktop

Download and install Docker Desktop using [this link](https://www.docker.com/products/docker-desktop).

### Step 2: Create a GitHub Account and Personal Access Token

To get started with GitHub MCP Server, follow these steps to set up your Personal Access Token:

1. Navigate to GitHub Settings > Developer settings > Personal access tokens.
2. Choose the repositories you want the token to access (public, all, or selected).
3. For full control over private repositories, create a token with the `repo` scope. Alternatively, if you're only dealing with public repositories, select the `public_repo` scope.
4. Copy your newly generated token.

![GitHub Personal Access Token Screenshot](/assets/images/github-token.png)

### Step 3: Install Claude Desktop

Follow the instructions provided by Claude Desktop to install it on your system.

### Step 4: Configure GitHub MCP Server with Docker

You can run MCP Server with Docker using the following configuration. This setup is designed to integrate with tools like Claude Desktop, but it works perfectly on its own as well.

```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "mcp/github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "XXX"
      }
    }
  }
}
```

Replace `XXX` with the GitHub Personal Access Token you generated.

### Step 5: Verify MCP Tools Availability

Ensure that all MCP tools are available and correctly configured in Claude Desktop.

### Step 6: Start with the Prompt

Here are some examples to get you started:

#### Example #1

```
You're a developer. Add the following and create a new repo with the following guidelines:

Create a clone of the repo
https://github.com/dockersamples/catalog-service-node
to your personal repository
https://github.com/ajeetraina/catalog-service-node-java

The repo is built using NodeJS and React with a couple of services; replace it with Java or Spring Boot.

Commit the changes at each step with meaningful comments.
Create a Git Graph using mermaid.js syntax and include it in the README file.
Write test cases and publish the results.
Feel free to ask questions until you're clear with the objective.
```

#### Example #2

```
I have a repo called
https://github.com/ajeetraina/bme680-jetson-neo4j
that fetches sensor data (temperature, pressure, and humidity) and sends it to Neo4j. 
Can you refer to the repo, simulate the values, and send them to my Neo4j graph database? 
Get me some 20-30 entries.
```

You'll see that a new repo is created—a clone of the existing repo with all the required files. You might require the following Claude config file for the second example:

```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "mcp/github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "XXXXXXXXX00fhaWf"
      }
    },
    "neo4j": {
      "command": "npx",
      "args": [
        "@alanse/mcp-neo4j-server"
      ],
      "env": {
        "NEO4J_URI": "neo4j://localhost:7687",
        "NEO4J_USERNAME": "neo4j",
        "NEO4J_PASSWORD": "XXXXX"
      }
    }
  }
}
```

## Why Use GitHub MCP Server?

GitHub MCP Server was designed with the busy developer in mind. Here are a few reasons why it's a game-changer:

- **Efficiency**: Automate repetitive GitHub operations and streamline your workflow.
- **Reliability**: With robust error handling and clear messaging, you'll know exactly what went wrong when issues arise.
- **Versatility**: Whether you need to manage repositories, push files in bulk, or perform advanced searches, GitHub MCP Server has you covered.

By integrating GitHub MCP Server into your development pipeline, you can focus on writing code rather than managing the intricacies of GitHub interactions.

## Conclusion

Managing GitHub operations doesn't have to be a cumbersome process. With GitHub MCP Server, you have a powerful tool at your fingertips to automate repository management, file operations, and advanced searches—all while preserving Git history and ensuring robust error handling.

Ready to simplify your GitHub workflow? Check out the GitHub MCP Server documentation, follow the demo steps above, and start optimizing your workflow today.
