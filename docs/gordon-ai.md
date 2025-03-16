---
layout: page
title: Gordon AI - Docker's CLI AI Assistant
---

# Gordon AI - Docker's CLI AI Assistant

Gordon is Docker's AI-powered command-line assistant that integrates with MCP servers to provide enhanced capabilities. This guide explains how to use Gordon with various MCP servers.

## What is Gordon?

Gordon is an AI assistant built into the Docker CLI. It allows you to interact with Docker and perform various tasks using natural language through the `docker ai` command. When combined with MCP servers, Gordon gains additional capabilities like time awareness, file access, web searches, and more.

## Setting Up Gordon with MCP Servers

Gordon uses a file named `gordon-mcp.yml` in your working directory to discover and connect to MCP servers. This is a standard Docker Compose file that defines which MCP servers Gordon should use in the current context.

### Basic Configuration

Here's a simple example of a `gordon-mcp.yml` file that adds time awareness to Gordon:

```yaml
services:
  time:
    image: mcp/time
```

With this configuration, you can ask Gordon time-related questions:

```bash
$ docker ai 'what time is it now in Paris?'

    • Calling get_current_time

  The current time in Paris, France is 5:43 PM on March 17, 2025.
```

### Multiple MCP Servers

You can include multiple MCP servers in your configuration to give Gordon different capabilities:

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

With this configuration, Gordon can tell you the time, fetch web content, and manipulate files in your current directory.

## Example Use Cases

### Web Content and File Management

Gordon can fetch web content and save it to a file:

```bash
$ docker ai 'fetch the content from docker.com and save a summary to summary.txt'

    • Calling fetch ✔️
    • Calling write_file ✔️
  
  I've fetched the content from docker.com, created a summary, and saved it to summary.txt in your current directory.
```

### Database Queries

With the PostgreSQL MCP server, Gordon can interact with your databases:

```yaml
services:
  postgres:
    image: mcp/postgres
    command: postgresql://username:password@hostname/database
```

```bash
$ docker ai 'what tables are in my database and how many users do I have?'

    • Calling get_schema ✔️
    • Calling query ✔️
  
  Your database has the following tables: users, products, orders, and categories.
  You currently have 1,245 users in your database.
```

### GitHub Repository Analysis

Gordon can help analyze and manage GitHub repositories:

```yaml
services:
  github:
    image: mcp/github
    environment:
      - GITHUB_PERSONAL_ACCESS_TOKEN=your_token_here
```

```bash
$ docker ai 'what are the recent PRs in my repository and summarize them'

    • Calling list_pull_requests ✔️
    • Calling get_pull_request (multiple calls) ✔️
  
  Here's a summary of your recent pull requests:
  1. PR #42: "Add new authentication feature" - Implements OAuth2 login process
  2. PR #41: "Fix navbar styling issues" - Resolves responsive design problems on mobile
  3. PR #40: "Update documentation" - Improves installation and configuration docs
```

## Advanced Configuration

### Resource Access Control

One of the benefits of using Docker containers for MCP servers is the ability to precisely control what resources Gordon can access. For example, with the filesystem server, you can limit file access to specific directories:

```yaml
services:
  fs:
    image: mcp/filesystem
    command:
      - /rootfs
    volumes:
      - ./public:/rootfs/public
      - ./docs:/rootfs/docs
```

This configuration only allows Gordon to access files in the `./public` and `./docs` directories.

### Environment Variables

Many MCP servers require API tokens or other configuration through environment variables:

```yaml
services:
  slack:
    image: mcp/slack
    environment:
      - SLACK_API_TOKEN=xoxb-your-token-here
```

## Known Working MCP Servers

The following MCP servers have been tested and confirmed to work with Gordon:

- **mcp/time**: Time and timezone operations
- **mcp/fetch**: Web content retrieval
- **mcp/filesystem**: File operations
- **mcp/postgres**: PostgreSQL database access
- **mcp/git**: Git repository management
- **mcp/sqlite**: SQLite database operations
- **mcp/github**: GitHub repository management

## Troubleshooting

### Common Issues

1. **MCP Server Not Found**
   - Ensure your `gordon-mcp.yml` file is in the current directory
   - Check that the image name is correct

2. **Permission Issues**
   - Make sure proper volume mounts and permissions are configured

3. **API Timeout**
   - Some API-based MCP servers may have rate limits or require authentication

### Viewing Logs

If you're encountering issues, you can view the logs of the running MCP servers using Docker Compose:

```bash
docker compose -f gordon-mcp.yml logs
```

Or for a specific service:

```bash
docker compose -f gordon-mcp.yml logs fs
```

## Additional Resources

- [Gordon Official Documentation](https://docs.docker.com/gordon/)
- [MCP Server Catalog](/servers-table.html)
- [Docker Hub MCP Repository](https://hub.docker.com/u/mcp)