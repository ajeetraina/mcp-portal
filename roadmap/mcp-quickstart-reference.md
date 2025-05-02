# Model Context Protocol (MCP) Quick Reference Guide

This quick reference provides essential commands, patterns, and code snippets for working with MCP. Use it alongside the MCP Roadmap and Hands-On Labs for fast implementation.

## Core Components

### MCP Architecture Overview

MCP consists of three primary components:

- **Hosts**: Applications users interact with (e.g., Claude Desktop, AI-enhanced IDEs)
- **Clients**: Components within hosts that handle connections to MCP servers
- **Servers**: Programs that expose capabilities to AI models

### Key Capabilities

MCP servers can expose three types of capabilities:

1. **Tools**: Functions that perform actions when invoked by AI models
2. **Resources**: Data sources that AI models can access
3. **Prompts**: Templates to guide AI models toward specific tasks

## Setup Commands

### Python SDK

```bash
# Install MCP SDK
pip install "mcp[cli]"

# Install with additional tools
pip install "mcp[cli]" httpx aiosqlite
```

### TypeScript SDK

```bash
# Install MCP SDK
npm install @modelcontextprotocol/sdk

# Create a project with additional tools
npm init
npm install @modelcontextprotocol/sdk express axios
```

### Docker Configuration

```bash
# Build MCP server container
docker build -t myserver .

# Run MCP server container
docker run -i myserver

# Run with environment variables
docker run -i -e API_KEY=your_key myserver
```

## Code Snippets

### Basic Python MCP Server

```python
import asyncio
from mcp.server import Server
from mcp.server.stdio import stdio_server

# Create a server instance
app = Server("example-server", version="1.0.0")

# Define a simple tool
@app.tool("hello_world")
async def hello_world(name: str = "World") -> dict:
    """Say hello to the user."""
    return {
        "message": f"Hello, {name}!"
    }

# Main function to run the server
async def main():
    async with stdio_server() as streams:
        await app.run(
            streams[0],
            streams[1],
            app.create_initialization_options()
        )

if __name__ == "__main__":
    asyncio.run(main())
```

### Basic TypeScript MCP Server

```typescript
import { Server } from "@modelcontextprotocol/sdk/server";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";

// Create a server instance
const server = new Server(
  { name: "example-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Define a simple tool
server.registerTool(
  {
    name: "hello_world",
    description: "Say hello to the user",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name to greet"
        }
      }
    }
  },
  async ({ name = "World" }) => {
    return {
      message: `Hello, ${name}!`
    };
  }
);

// Connect and start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

### Resource Implementation (Python)

```python
@app.resource("myapp://documents/{id}")
async def get_document(id: str):
    """Retrieve a document by ID."""
    try:
        # Load document from storage
        document = await load_document(id)
        
        return {
            "content": document.content,
            "content_type": "text/markdown"
        }
    except:
        return None

@app.list_resources()
async def list_resources():
    """List available resources."""
    documents = await get_all_documents()
    
    return [
        {"uri": f"myapp://documents/{doc.id}", "name": doc.title}
        for doc in documents
    ]
```

### Tool with Schema (Python)

```python
@app.tool(
    "search_data",
    parameters={
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "Search query"
            },
            "limit": {
                "type": "integer",
                "description": "Maximum number of results",
                "default": 10,
                "minimum": 1,
                "maximum": 100
            }
        },
        "required": ["query"]
    }
)
async def search_data(query: str, limit: int = 10):
    """Search for data matching the query."""
    # Implement search logic
    results = await perform_search(query, limit)
    
    return {
        "query": query,
        "results": results,
        "count": len(results)
    }
```

## Configuration Patterns

### Claude Desktop Configuration

```json
{
  "mcpServers": {
    "my-server": {
      "command": "python",
      "args": ["my_server.py"]
    },
    "docker-server": {
      "command": "docker",
      "args": ["run", "-i", "my-mcp-server"]
    }
  }
}
```

### Docker Compose Configuration

```yaml
version: '3'
services:
  mcp-server:
    build: .
    environment:
      - API_KEY=${API_KEY}
    volumes:
      - ./data:/app/data
    ports:
      - "8080:8080"
  database:
    image: postgres:14
    environment:
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_DB=${DB_NAME}
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

## Common Patterns

### Error Handling

```python
@app.tool("perform_action")
async def perform_action(param: str):
    try:
        # Attempt to perform the action
        result = await do_something(param)
        return {
            "success": True,
            "result": result
        }
    except ValueError as e:
        # Handle validation errors
        return {
            "success": False,
            "error": "Validation error",
            "message": str(e)
        }
    except Exception as e:
        # Handle general errors
        return {
            "success": False,
            "error": "Operation failed",
            "message": str(e)
        }
```

### Authentication Pattern

```python
async def verify_token(token: str) -> bool:
    # Implement your token verification logic
    # ...
    return is_valid

@app.tool("secured_operation")
async def secured_operation(token: str, operation_param: str):
    # Verify the token
    if not await verify_token(token):
        return {
            "success": False,
            "error": "Authentication failed"
        }
    
    # Proceed with the operation
    result = await perform_operation(operation_param)
    
    return {
        "success": True,
        "result": result
    }
```

### Async Database Query

```python
import aiosqlite

@app.tool("query_database")
async def query_database(query: str):
    # Security check - ensure read-only query
    if not query.lower().strip().startswith("select"):
        return {
            "error": "Only SELECT queries are allowed"
        }
    
    try:
        async with aiosqlite.connect("database.db") as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(query)
            rows = await cursor.fetchall()
            
            # Convert rows to dictionaries
            result = [dict(row) for row in rows]
            
            return {
                "success": True,
                "data": result,
                "count": len(result)
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
```

## Testing and Debugging

### Using MCP Inspector

1. Install MCP Inspector: `pip install "mcp[inspector]"`
2. Start your MCP server
3. Run the inspector: `mcp inspect --command "python my_server.py"`
4. Use the web interface to test your server's capabilities

### Unit Testing MCP Servers

```python
import pytest
import json
from mcp.testing import TestClient

from my_server import app

@pytest.fixture
async def client():
    async with TestClient(app) as client:
        yield client

@pytest.mark.asyncio
async def test_hello_world(client):
    # Call the hello_world tool
    result = await client.call_tool("hello_world", {"name": "Test"})
    
    # Check the result
    assert result["message"] == "Hello, Test!"
```

## Common MCP Server Types

| Server Type | Purpose | Typical Capabilities |
|-------------|---------|---------------------|
| File System | Access local files | List files, read file content, write files |
| Database | Query databases | Execute queries, get schema, list tables |
| API Proxy | Access external APIs | Make API calls, handle authentication |
| RAG | Retrieval-Augmented Generation | Search documents, semantic retrieval |
| Business Process | Automate workflows | Initiate processes, check status |
| Authentication | Handle user identity | Login, verify tokens, register users |

## Best Practices

1. **Security First**: Always validate inputs and implement proper authentication
2. **Error Handling**: Return informative error messages with appropriate structure
3. **Documentation**: Provide clear descriptions for all tools, resources, and parameters
4. **Statelessness**: Design servers to be stateless where possible for easier scaling
5. **Monitoring**: Implement logging for all server operations
6. **Rate Limiting**: Protect backend systems with appropriate rate limits
7. **Validation**: Use JSON Schema to validate all inputs
8. **Versioning**: Include version information in server metadata

## Common Issues and Solutions

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| Connection failure | Transport configuration | Check stdio/TCP settings and permissions |
| Tool not invoked | Schema mismatch | Verify tool schema matches implementation |
| Slow performance | Inefficient processing | Implement caching, connection pooling |
| Authentication errors | Token handling | Check token validation and expiration |
| Memory leaks | Resource cleanup | Ensure proper cleanup in async handlers |
| Permission issues | Access control | Implement proper authorization checks |

## Further Resources

- [Official MCP Documentation](https://modelcontextprotocol.io/docs/)
- [MCP GitHub Organization](https://github.com/modelcontextprotocol)
- [MCP Server Examples](https://github.com/modelcontextprotocol/servers)
- [Community MCP Servers](https://github.com/punkpeye/awesome-mcp-servers)