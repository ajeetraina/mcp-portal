---
layout: page
title: Getting Started with Docker MCP
---

# Getting Started with Docker MCP

Welcome to the Docker Model Context Protocol (MCP) Community Portal! This guide will help you get started with MCP, understand its core concepts, and show you how to use it in your projects.

## What is Docker MCP?

The Docker Model Context Protocol (MCP) is a standardized interface for model serving. It provides a consistent way to interact with AI/ML models, making it easier to build, deploy, and manage model-based applications.

## Core Concepts

### MCP Servers

MCP Servers are implementations of the Model Context Protocol that handle requests to AI models. They provide a standardized API that applications can use to interact with models, regardless of the underlying model implementation.

### Context

Context is a key concept in MCP. It refers to the information that is passed to the model to influence its output. This can include conversation history, user preferences, or any other information that helps the model generate more relevant responses.

### Models

Models are the AI/ML models that perform the actual computation. MCP provides a standard way to interact with these models, making it easier to switch between different model implementations.

## Getting Started

### 1. Choose an MCP Server

Browse the [MCP Servers list](/) on our portal and choose one that fits your needs. Each server has different features, optimizations, and use cases.

### 2. Pull the Docker Image

Once you've chosen an MCP server, pull the Docker image:

```bash
docker pull mcp/server:latest
```

### 3. Run the MCP Server

Run the MCP server as a Docker container:

```bash
docker run -p 8080:8080 mcp/server:latest
```

### 4. Interact with the MCP Server

You can now interact with the MCP server using HTTP requests or by using one of the MCP client libraries available in the [Tools section](/tools).

## Example Request

Here's a simple example of how to send a request to an MCP server:

```bash
curl -X POST http://localhost:8080/v1/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "example-model",
    "prompt": "Hello, world!",
    "context": {
      "history": []
    }
  }'
```

## Next Steps

- Explore the [MCP Servers](/) list to find servers with different features and optimizations
- Check out the [MCP Tools](/tools) section for client libraries, extensions, and other tools
- Contribute to the MCP community by [adding your own MCP server or tool](https://github.com/ajeetraina/docker-mcp-portal/blob/main/CONTRIBUTING.md)

## Resources

- [Docker MCP GitHub Repository](https://github.com/docker/mcp)
- [Docker MCP Documentation](https://docs.docker.com/mcp/)
- [Docker Blog: Introducing MCP](https://www.docker.com/blog/model-context-protocol/)

## Community

Join the MCP community to discuss, collaborate, and contribute to the development of MCP:

- [GitHub Repository](https://github.com/ajeetraina/docker-mcp-portal)
- [Collabnix Community](https://collabnix.com)
