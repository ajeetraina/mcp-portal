---
layout: page
title: Getting Started with Docker MCP
---

# Getting Started with Docker MCP

Welcome to the Docker Model Context Protocol (MCP) Community Portal! This guide will help you understand how Docker integrates with the Model Context Protocol and show you how to get started using Docker's containerized MCP servers.

## What is MCP and Docker's Role?

The Model Context Protocol (MCP) is an open protocol designed by Anthropic that standardizes how applications provide context to large language models. MCP functions as a client-server protocol, where the client (e.g., an application like Gordon or Claude Desktop) sends requests, and the server processes those requests to deliver the necessary context to the AI.

Docker has partnered with Anthropic to build container images for the reference implementations of MCP servers, available on Docker Hub under the `mcp/` namespace.

## Using MCP Servers with Docker

There are two primary ways to use Docker's MCP server containers:

### 1. With Gordon (Docker's AI CLI tool)

Gordon is Docker's command-line AI assistant. When you run the `docker ai` command in your terminal, Gordon looks for a `gordon-mcp.yml` file in your working directory. This file is a Docker Compose file that configures MCP servers as Compose services for Gordon to access.

#### Simple Example with the Time Server

Create a `gordon-mcp.yml` file in your project directory with the following content:

```yaml
services:
  time:
    image: mcp/time
```

Now you can ask Gordon time-related questions:

```bash
$ docker ai 'what time is it now in Tokyo?'

    • Calling get_current_time

  The current time in Tokyo, Japan is 11:24 AM on March 17, 2025.
```

#### Using Multiple MCP Servers

Gordon can work with any number of MCP servers. Here's an example that provides both web and filesystem access:

```yaml
services:
  fetch:
    image: mcp/fetch
  fs:
    image: mcp/filesystem
    command:
      - /rootfs
    volumes:
      - .:/rootfs
```

This configuration allows Gordon to fetch web content and interact with files in your current directory.

### 2. With Claude Desktop or Other MCP Clients

You can also use Docker's MCP server containers with other MCP-compatible clients like Claude Desktop:

1. **Pull an MCP server container**:

   ```bash
   docker pull mcp/filesystem
   ```

2. **Run the container**:

   ```bash
   docker run -p 8080:8080 -v /path/to/files:/rootfs mcp/filesystem /rootfs
   ```

3. **Configure your MCP client** to connect to the running container.

## Available MCP Servers on Docker Hub

Docker provides a variety of MCP servers under the `mcp/` namespace, including:

### Known Working MCP Servers with Gordon

- **mcp/time**: Time and timezone capabilities
- **mcp/fetch**: Web content retrieval
- **mcp/filesystem**: Secure file operations
- **mcp/postgres**: PostgreSQL database interaction
- **mcp/git**: Git repository management
- **mcp/sqlite**: SQLite database interaction
- **mcp/github**: GitHub repository management 

### Additional MCP Servers (May Require API Tokens)

- **mcp/brave-search**: Web search capabilities
- **mcp/gdrive**: Google Drive integration
- **mcp/slack**: Slack messaging capabilities
- **mcp/google-maps**: Location services
- **mcp/gitlab**: GitLab integration
- **mcp/everything**: Reference implementation with various tools
- **mcp/aws-kb-retrieval-server**: AWS Knowledge Base interaction
- **mcp/sentry**: Error tracking integration

## Advanced Usage with Docker Compose

Since the `gordon-mcp.yml` file is a Docker Compose file, you can use all the standard Docker Compose features to configure your MCP servers:

### Environment Variables

```yaml
services:
  github:
    image: mcp/github
    environment:
      - GITHUB_TOKEN=your_token_here
```

### Volume Mounts

```yaml
services:
  fs:
    image: mcp/filesystem
    command:
      - /rootfs
    volumes:
      - ./projects:/rootfs/projects
      - ./documents:/rootfs/documents
```

### Network Configuration

```yaml
services:
  postgres:
    image: mcp/postgres
    networks:
      - db_network

networks:
  db_network:
    external: true
```

## Next Steps

Now that you understand Docker's integration with MCP, here are some suggestions for next steps:

1. **Explore Available Servers**: Browse our [catalog of MCP servers](/servers-table.html) to discover their capabilities
2. **Try Different Configurations**: Experiment with different combinations of MCP servers in your `gordon-mcp.yml` file
3. **Build Custom Solutions**: Combine MCP servers with your existing Docker workflows and infrastructure
4. **Contribute**: If you develop your own MCP server, consider containerizing it and sharing it with the community