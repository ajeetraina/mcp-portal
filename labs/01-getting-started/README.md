# Lab 1: Getting Started with MCP

This lab introduces you to the Model Context Protocol (MCP) and helps you set up your first MCP server.

## Prerequisites

- Docker installed on your machine
- Basic familiarity with command line interfaces
- A text editor of your choice

## Introduction

Model Context Protocol (MCP) enables AI models like Claude to interact with external tools and services. In this lab, you'll:

1. Set up a basic MCP environment
2. Run your first MCP servers
3. Create a simple interaction between Claude and your tools

## Step 1: Setting Up Your Environment

Create a new directory for your MCP project:

```bash
mkdir my-first-mcp
cd my-first-mcp
```

Create a `docker-compose.yml` file:

```yaml
version: '3'
services:
  mcp:
    image: anthropic/mcp-proxy:latest
    ports:
      - "8080:8080"
    environment:
      - MCP_API_KEY=${MCP_API_KEY}
      - CLAUDE_API_KEY=${CLAUDE_API_KEY}
    volumes:
      - ./config:/app/config
```

Create a basic configuration file in `config/tools.json`:

```json
{
  "tools": [
    {
      "name": "time",
      "service": "time",
      "description": "Gets the current date and time",
      "schema": {
        "type": "function",
        "function": {
          "name": "time",
          "description": "Gets the current date and time",
          "parameters": {
            "type": "object",
            "properties": {
              "timezone": {
                "type": "string",
                "description": "Optional timezone (e.g., 'UTC', 'America/New_York')"
              }
            },
            "required": []
          }
        }
      }
    }
  ]
}
```

## Step 2: Running Your First MCP Server

Start the services:

```bash
export MCP_API_KEY=your_mcp_api_key
export CLAUDE_API_KEY=your_claude_api_key
docker-compose up -d
```

Verify that the server is running:

```bash
curl http://localhost:8080/healthz
```

You should see a response indicating the server is healthy.

## Step 3: Creating Your First MCP Conversation

Now, you can use the MCP server in your application. Here's a simple Python example:

```python
import requests
import json

API_KEY = "your_claude_api_key"
MCP_URL = "http://localhost:8080/v1/messages"

headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

conversation = {
    "model": "claude-3-opus-20240229",
    "messages": [
        {"role": "user", "content": "What time is it right now?"}
    ],
    "tools": [
        {
            "name": "time",
            "description": "Gets the current date and time"
        }
    ]
}

response = requests.post(MCP_URL, headers=headers, json=conversation)
result = response.json()
print(json.dumps(result, indent=2))
```

## Next Steps

- Try adding more tools to your configuration
- Experiment with different queries to Claude that would trigger tool use
- Move on to Lab 2 to learn about more advanced MCP features

## Troubleshooting

- If you encounter connection issues, ensure Docker is running properly
- Check that your API keys are correctly set in your environment
- Verify that the ports are correctly exposed in your docker-compose file
