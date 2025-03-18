---
layout: page
title: Lab 1: First Steps with Docker MCP Servers
---

# Lab 1: First Steps with Docker MCP Servers

In this beginner-friendly hands-on lab, you'll set up your first MCP servers with Docker and learn to interact with them using Gordon AI.

**Time to complete:** 30 minutes

**Prerequisites:**
- Docker Desktop installed
- Basic command line knowledge

## Learning Objectives

By the end of this lab, you'll be able to:
1. Set up multiple MCP servers using Docker Compose
2. Configure proper filesystem mounts and permissions
3. Interact with MCP servers using Gordon AI
4. Understand how MCP servers communicate with AI assistants

## Step 1: Create Your Lab Environment

First, create a new directory for your lab:

```bash
mkdir mcp-lab1
cd mcp-lab1
```

Create a new file called `data.txt` with some sample content:

```bash
echo "This is sample text for our MCP lab experiment. The Docker MCP integration is awesome!" > data.txt
```

## Step 2: Set Up Your First MCP Servers

Create a file named `gordon-mcp.yml` with the following content:

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

This configuration sets up two MCP servers:
- A time server that provides date and time information
- A filesystem server that gives access to the current directory

## Step 3: Interact with Your MCP Servers

Now let's test our setup with some questions for Gordon AI:

```bash
# Ask a time-related question
docker ai "What time is it now in New York, Tokyo, and London? Show the date too."

# Ask a question that requires filesystem access
docker ai "What's in the data.txt file? Count the words and tell me how many there are."
```

You should see Gordon AI accessing the appropriate MCP servers to answer your questions.

## Step 4: Extend Your MCP Configuration

Let's add another MCP server to our setup. Update your `gordon-mcp.yml` file:

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

Now you can ask Gordon AI to fetch web content:

```bash
docker ai "Fetch the Docker homepage and write a brief summary of what Docker is to a file called docker-summary.txt"
```

## Step 5: Examine Container Operations

While Gordon is handling your requests, you can observe how Docker manages these MCP servers:

```bash
# List running containers
docker ps

# View logs from a specific MCP server
docker logs mcp-fetch
```

Notice how containers are created and managed as needed for each interaction.

## Understanding What's Happening

When you run `docker ai` with your `gordon-mcp.yml` configuration:

1. Gordon checks the `gordon-mcp.yml` file to discover available MCP servers
2. When needed, Gordon starts the required MCP server containers
3. Gordon sends requests to the appropriate MCP servers based on your query
4. MCP servers process the requests and return results to Gordon
5. Gordon uses this context to formulate a comprehensive response

## Experiment on Your Own

Try these additional exercises:

1. Create a more complex file structure and ask Gordon to navigate and summarize it
2. Ask Gordon to combine information from multiple sources (time + web content)
3. Try modifying the filesystem mount to restrict access to only certain directories

## Troubleshooting

If you encounter issues:

- Ensure Docker is running properly
- Check that your `gordon-mcp.yml` file is in the current directory
- Verify the syntax of your YAML file
- Try restarting Docker Desktop if containers won't start

## Next Steps

Congratulations on completing your first MCP lab! Now you can move on to:

- [Lab 2: Building a Research Assistant with MCP](/docs/labs/research-assistant-lab)
- [Lab 3: Database Operations with MCP Servers](/docs/labs/database-operations-lab)
