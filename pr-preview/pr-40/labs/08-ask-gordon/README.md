# Lab 8: Working with Ask Gordon and MCP

This lab introduces you to Docker's Ask Gordon CLI assistant and how to use it with MCP servers.

## Prerequisites

- Docker installed on your machine
- Basic familiarity with command line interfaces
- Understanding of MCP basics (recommended to complete Lab 1 first)

## Introduction

Ask Gordon is Docker's AI-powered CLI assistant that can help you with Docker-related tasks. When integrated with Model Context Protocol (MCP) servers, Ask Gordon can access external tools and data sources to provide more powerful and contextualized assistance.

## Setting Up Ask Gordon with MCP

To set up Ask Gordon with MCP servers, you'll need to create a `gordon-mcp.yml` file in your project directory:

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

This configuration enables Ask Gordon to access three MCP servers:
- `time`: Provides date and time information
- `fetch`: Allows accessing remote web content
- `fs`: Enables file system operations within the specified directory

## Using Ask Gordon with MCP

Once you've set up the `gordon-mcp.yml` file, you can use Ask Gordon with the following command:

```bash
docker ai 'what time is it in Tokyo?'
```

This command will:
1. Start the necessary MCP servers specified in your configuration
2. Send your query to the AI assistant
3. Use the appropriate MCP server (in this case, the time server)
4. Return the response

## Example Interactions

Here are some examples of tasks you can perform with Ask Gordon and MCP:

### Time Queries
```bash
docker ai 'what time is it in San Francisco?'
docker ai 'what's the current date in UTC format?'
```

### Web Fetch
```bash
docker ai 'what's the current weather in New York?'
docker ai 'can you summarize the content of https://docs.docker.com/engine/reference/commandline/ai/'
```

### File System Operations
```bash
docker ai 'list all JavaScript files in this directory'
docker ai 'create a simple Hello World Dockerfile'
```

## Advanced Configuration

You can customize your MCP server configuration for Ask Gordon by modifying the `gordon-mcp.yml` file:

```yaml
services:
  time:
    image: mcp/time
    # Custom time server configuration

  fetch:
    image: mcp/fetch
    environment:
      - TIMEOUT=10s
    # Custom fetch server settings

  fs:
    image: mcp/filesystem
    command:
      - /rootfs
    volumes:
      - ./my-project:/rootfs
    # Limit file access to specific directory
```

## Troubleshooting

If you encounter issues with Ask Gordon and MCP:

1. **MCP Server Connection**: Ensure MCP servers are running and accessible
2. **Permission Issues**: Check that Docker has appropriate permissions
3. **Configuration File**: Verify your `gordon-mcp.yml` file is correctly formatted
4. **Volume Mounts**: Ensure your file paths in volume mounts are correct

## Next Steps

Now that you're familiar with Ask Gordon and MCP, you can:

- Explore other available MCP servers to extend functionality
- Create custom prompts to leverage different MCP server capabilities
- Combine multiple MCP servers in a single workflow
- Build your own custom MCP servers for specific tasks

## Conclusion

Ask Gordon combined with MCP provides a powerful interface for interacting with your Docker environment and external tools. This integration enables more contextual assistance and automates many common tasks through natural language interaction.

For more information, check the official Docker documentation.
