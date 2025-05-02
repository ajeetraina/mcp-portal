# Model Context Protocol (MCP) Hands-On Labs

This document provides a series of structured, hands-on labs that complement the MCP Developer Roadmap. Each lab is designed to reinforce key concepts through practical application, gradually building your skills from basic to advanced MCP development.

## Lab 1: Your First MCP Server

**Objective:** Create and run a simple MCP server that provides the current time.

**Prerequisites:**
- Python 3.10+ or Node.js
- Docker
- Basic knowledge of async programming

**Steps:**

1. **Setup your environment:**

```bash
# Create a new directory
mkdir time-mcp-server
cd time-mcp-server

# Create a Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install MCP SDK
pip install "mcp[cli]"
```

2. **Create a basic MCP server (time_server.py):**

```python
import asyncio
import datetime
from mcp.server import Server
from mcp.server.stdio import stdio_server

# Create a server instance
app = Server("time-server", version="1.0.0")

# Define a simple time tool
@app.tool("get_time")
async def get_time(timezone=None):
    """Get the current time, optionally in a specific timezone."""
    current_time = datetime.datetime.now()
    
    # For simplicity, we're not handling timezone conversion in this example
    if timezone:
        return {
            "time": current_time.isoformat(),
            "timezone_requested": timezone,
            "note": "Timezone conversion not implemented in this example"
        }
    
    return {
        "time": current_time.isoformat(),
        "timezone": "server local time"
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

3. **Create a Docker configuration:**

Create a file named `Dockerfile`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY time_server.py .

CMD ["python", "time_server.py"]
```

Create a file named `requirements.txt`:

```
mcp[cli]>=0.1.0
```

4. **Build and run the Docker container:**

```bash
docker build -t time-mcp-server .
docker run -i time-mcp-server
```

5. **Configure Claude Desktop to use your server:**

Add the following to your Claude Desktop configuration file:

```json
{
  "mcpServers": {
    "time-server": {
      "command": "docker",
      "args": ["run", "-i", "time-mcp-server"]
    }
  }
}
```

6. **Test your server:**

In Claude Desktop, ask a question like:
- "What time is it right now?"
- "Can you tell me the current time?"

**Expected Outcome:**
Claude should invoke your MCP server and return the current time. You can verify this by looking at the server logs and seeing the tool invocation.

## Lab 2: File System Resources

**Objective:** Create an MCP server that provides access to files and directories.

**Prerequisites:**
- Completion of Lab 1
- Basic understanding of file systems

**Steps:**

1. **Setup your environment:**

```bash
mkdir fs-mcp-server
cd fs-mcp-server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install "mcp[cli]"
```

2. **Create a sample documents directory and files:**

```bash
mkdir -p documents
echo "This is a sample text file." > documents/sample.txt
echo "# Sample Markdown File\n\nThis is a markdown file with some **formatted** content." > documents/readme.md
```

3. **Create a file system MCP server (fs_server.py):**

```python
import asyncio
import os
import pathlib
from typing import Optional, List
from mcp.server import Server
from mcp.server.stdio import stdio_server
import mcp.types as types

# Create a server instance
app = Server("fs-server", version="1.0.0")

# Define the base directory for all file operations
BASE_DIR = pathlib.Path("documents").absolute()

# List files resource
@app.list_resources()
async def list_resources() -> List[types.Resource]:
    """List all available files in the documents directory."""
    resources = []
    
    for file_path in BASE_DIR.glob("**/*"):
        if file_path.is_file():
            # Create a relative path from the base directory
            rel_path = file_path.relative_to(BASE_DIR)
            # Convert to a resource URI
            uri = f"fs://documents/{rel_path}"
            resources.append(
                types.Resource(
                    uri=uri,
                    name=str(rel_path),
                    description=f"File: {rel_path}"
                )
            )
    
    return resources

# Get file content resource
@app.resource("fs://documents/{file_path}")
async def get_file(file_path: str) -> Optional[types.ResourceContent]:
    """Get the content of a specific file."""
    # Ensure the path is within our base directory
    full_path = BASE_DIR / file_path
    
    # Security check - ensure the path is within the base directory
    try:
        full_path.relative_to(BASE_DIR)
    except ValueError:
        # Path is outside the base directory
        return None
    
    if not full_path.exists() or not full_path.is_file():
        return None
    
    # Determine content type based on file extension
    content_type = "text/plain"
    if full_path.suffix.lower() == ".md":
        content_type = "text/markdown"
    elif full_path.suffix.lower() == ".html":
        content_type = "text/html"
    
    # Read the file content
    content = full_path.read_text(encoding="utf-8")
    
    return types.ResourceContent(
        content=content,
        content_type=content_type
    )

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

4. **Create a Docker configuration:**

Create a file named `Dockerfile`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY fs_server.py .
COPY documents/ ./documents/

CMD ["python", "fs_server.py"]
```

Create a file named `requirements.txt`:

```
mcp[cli]>=0.1.0
```

5. **Build and run the Docker container:**

```bash
docker build -t fs-mcp-server .
docker run -i fs-mcp-server
```

6. **Configure Claude Desktop to use your server:**

Update your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "fs-server": {
      "command": "docker",
      "args": ["run", "-i", "fs-mcp-server"]
    }
  }
}
```

7. **Test your server:**

In Claude Desktop, ask questions like:
- "What files do you have access to?"
- "Can you show me the content of sample.txt?"
- "What's in the readme.md file?"

**Expected Outcome:**
Claude should list the available files and display their contents when requested.

## Lab 3: Weather API Integration

**Objective:** Create an MCP server that integrates with a weather API to provide weather forecasts.

**Prerequisites:**
- Completion of previous labs
- An API key from a weather service like OpenWeatherMap or WeatherAPI

**Steps:**

1. **Setup your environment:**

```bash
mkdir weather-mcp-server
cd weather-mcp-server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install "mcp[cli]" httpx
```

2. **Create a weather API MCP server (weather_server.py):**

```python
import asyncio
import os
from typing import Dict, Any, Optional
from mcp.server import Server
from mcp.server.stdio import stdio_server
import httpx

# Create a server instance
app = Server("weather-server", version="1.0.0")

# Replace with your actual API key
WEATHER_API_KEY = os.environ.get("WEATHER_API_KEY", "your_api_key_here")
WEATHER_BASE_URL = "https://api.weatherapi.com/v1"

# Weather forecast tool
@app.tool(
    "get_weather",
    parameters={
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "City name or coordinates (e.g., 'London', 'New York', '37.7749,-122.4194')"
            },
            "days": {
                "type": "integer",
                "description": "Number of days forecast (1-3)",
                "minimum": 1,
                "maximum": 3
            }
        },
        "required": ["location"]
    }
)
async def get_weather(location: str, days: int = 1) -> Dict[str, Any]:
    """Get weather forecast for a specific location."""
    try:
        # Ensure days is within acceptable range
        days = max(1, min(3, days))
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{WEATHER_BASE_URL}/forecast.json",
                params={
                    "key": WEATHER_API_KEY,
                    "q": location,
                    "days": days,
                    "aqi": "no",
                    "alerts": "no"
                }
            )
            
            # Check for successful response
            response.raise_for_status()
            data = response.json()
            
            # Extract and format relevant information
            result = {
                "location": {
                    "name": data["location"]["name"],
                    "region": data["location"]["region"],
                    "country": data["location"]["country"],
                    "local_time": data["location"]["localtime"]
                },
                "current": {
                    "temperature_c": data["current"]["temp_c"],
                    "temperature_f": data["current"]["temp_f"],
                    "condition": data["current"]["condition"]["text"],
                    "humidity": data["current"]["humidity"],
                    "wind_kph": data["current"]["wind_kph"]
                },
                "forecast": []
            }
            
            # Add forecast data
            for day in data["forecast"]["forecastday"]:
                result["forecast"].append({
                    "date": day["date"],
                    "max_temp_c": day["day"]["maxtemp_c"],
                    "min_temp_c": day["day"]["mintemp_c"],
                    "condition": day["day"]["condition"]["text"],
                    "chance_of_rain": day["day"]["daily_chance_of_rain"]
                })
            
            return result
            
    except Exception as e:
        return {
            "error": f"Failed to get weather: {str(e)}",
            "location": location
        }

# Current conditions simplified tool
@app.tool("current_weather")
async def current_weather(location: str) -> Dict[str, Any]:
    """Get current weather conditions for a location."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{WEATHER_BASE_URL}/current.json",
                params={
                    "key": WEATHER_API_KEY,
                    "q": location
                }
            )
            
            # Check for successful response
            response.raise_for_status()
            data = response.json()
            
            return {
                "location": data["location"]["name"],
                "temperature_c": data["current"]["temp_c"],
                "condition": data["current"]["condition"]["text"],
                "humidity": data["current"]["humidity"],
                "wind_kph": data["current"]["wind_kph"],
                "updated": data["current"]["last_updated"]
            }
            
    except Exception as e:
        return {
            "error": f"Failed to get current weather: {str(e)}",
            "location": location
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

3. **Create a Docker configuration:**

Create a file named `Dockerfile`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY weather_server.py .

# Set environment variable for API key (replace at runtime)
ENV WEATHER_API_KEY="your_api_key_here"

CMD ["python", "weather_server.py"]
```

Create a file named `requirements.txt`:

```
mcp[cli]>=0.1.0
httpx>=0.24.0
```

4. **Build and run the Docker container:**

```bash
docker build -t weather-mcp-server .
docker run -i -e WEATHER_API_KEY=your_actual_api_key weather-mcp-server
```

5. **Configure Claude Desktop to use your server:**

Update your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "weather-server": {
      "command": "docker",
      "args": ["run", "-i", "-e", "WEATHER_API_KEY=your_actual_api_key", "weather-mcp-server"]
    }
  }
}
```

6. **Test your server:**

In Claude Desktop, ask questions like:
- "What's the weather in London right now?"
- "What's the forecast for San Francisco for the next 3 days?"
- "Is it going to rain tomorrow in Tokyo?"

**Expected Outcome:**
Claude should query your server to get real-time weather information and forecasts for the requested locations.

## Lab 4: Database Integration

**Objective:** Create an MCP server that connects to a SQLite database for querying and data retrieval.

**Prerequisites:**
- Completion of previous labs
- Basic SQL knowledge

**Steps:**

1. **Setup your environment:**

```bash
mkdir db-mcp-server
cd db-mcp-server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install "mcp[cli]" aiosqlite
```

2. **Create a sample database:**

```python
import sqlite3

# Create a sample database
conn = sqlite3.connect('sample.db')
cursor = conn.cursor()

# Create tables
cursor.execute('''
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    in_stock BOOLEAN NOT NULL
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    registration_date TEXT NOT NULL
)
''')

# Insert sample data
products = [
    (1, 'Laptop', 'Electronics', 999.99, True),
    (2, 'Smartphone', 'Electronics', 699.99, True),
    (3, 'Headphones', 'Electronics', 149.99, True),
    (4, 'Monitor', 'Electronics', 299.99, False),
    (5, 'Desk Chair', 'Furniture', 199.99, True),
    (6, 'Office Desk', 'Furniture', 349.99, False),
    (7, 'Notebook', 'Stationery', 4.99, True),
    (8, 'Pen Set', 'Stationery', 12.99, True)
]

customers = [
    (1, 'John Smith', 'john.smith@example.com', '2023-01-15'),
    (2, 'Jane Doe', 'jane.doe@example.com', '2023-02-20'),
    (3, 'Robert Johnson', 'robert.j@example.com', '2023-03-05'),
    (4, 'Sarah Williams', 'sarah.w@example.com', '2023-04-10'),
    (5, 'Michael Brown', 'michael.b@example.com', '2023-05-22')
]

cursor.executemany('INSERT OR REPLACE INTO products VALUES (?, ?, ?, ?, ?)', products)
cursor.executemany('INSERT OR REPLACE INTO customers VALUES (?, ?, ?, ?)', customers)

# Commit changes and close connection
conn.commit()
conn.close()

print("Sample database created successfully!")
```

Save this as `create_db.py` and run it to create the sample database:

```bash
python create_db.py
```

3. **Create a database MCP server (db_server.py):**

```python
import asyncio
import json
import aiosqlite
from typing import Dict, Any, List, Optional
from mcp.server import Server
from mcp.server.stdio import stdio_server

# Create a server instance
app = Server("db-server", version="1.0.0")

# Database path
DB_PATH = "sample.db"

# Helper function to convert SQL results to dictionaries
def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

# Query database tool
@app.tool(
    "query_database",
    parameters={
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "SQL query to execute (SELECT statements only)"
            },
            "params": {
                "type": "array",
                "description": "Optional parameters for the query",
                "items": {
                    "type": "string"
                }
            }
        },
        "required": ["query"]
    }
)
async def query_database(query: str, params: Optional[List[str]] = None) -> Dict[str, Any]:
    """Execute a read-only SQL query against the database."""
    # Security check - only allow SELECT queries
    query = query.strip()
    if not query.lower().startswith("select"):
        return {
            "error": "Only SELECT queries are allowed for security reasons",
            "results": []
        }
    
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = dict_factory
            params = params or []
            cursor = await db.execute(query, params)
            rows = await cursor.fetchall()
            
            return {
                "results": rows,
                "count": len(rows)
            }
            
    except Exception as e:
        return {
            "error": f"Query failed: {str(e)}",
            "results": []
        }

# Get available tables tool
@app.tool("list_tables")
async def list_tables() -> Dict[str, Any]:
    """List all tables in the database."""
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = dict_factory
            cursor = await db.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
            )
            tables = await cursor.fetchall()
            
            result = {
                "tables": [table["name"] for table in tables]
            }
            
            # Get schema for each table
            result["schemas"] = {}
            for table in result["tables"]:
                cursor = await db.execute(f"PRAGMA table_info({table})")
                columns = await cursor.fetchall()
                result["schemas"][table] = columns
            
            return result
            
    except Exception as e:
        return {
            "error": f"Failed to list tables: {str(e)}",
            "tables": []
        }

# Get table data tool
@app.tool("get_table_data")
async def get_table_data(table_name: str, limit: int = 10) -> Dict[str, Any]:
    """Get data from a specific table with a limit."""
    try:
        # Security check - validate table name to prevent SQL injection
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = dict_factory
            
            # Check if table exists
            cursor = await db.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
                (table_name,)
            )
            if not await cursor.fetchone():
                return {
                    "error": f"Table '{table_name}' does not exist",
                    "data": []
                }
            
            # Get table data
            cursor = await db.execute(
                f"SELECT * FROM '{table_name}' LIMIT ?",
                (limit,)
            )
            rows = await cursor.fetchall()
            
            return {
                "table": table_name,
                "data": rows,
                "count": len(rows)
            }
            
    except Exception as e:
        return {
            "error": f"Failed to get table data: {str(e)}",
            "data": []
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

4. **Create a Docker configuration:**

Create a file named `Dockerfile`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY db_server.py .
COPY create_db.py .
COPY sample.db .

CMD ["python", "db_server.py"]
```

Create a file named `requirements.txt`:

```
mcp[cli]>=0.1.0
aiosqlite>=0.19.0
```

5. **Build and run the Docker container:**

```bash
docker build -t db-mcp-server .
docker run -i db-mcp-server
```

6. **Configure Claude Desktop to use your server:**

Update your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "db-server": {
      "command": "docker",
      "args": ["run", "-i", "db-mcp-server"]
    }
  }
}
```

7. **Test your server:**

In Claude Desktop, ask questions like:
- "What tables are in the database?"
- "Show me the products in the Electronics category."
- "How many customers are registered after February 2023?"

**Expected Outcome:**
Claude should query the database through your MCP server and return formatted results based on your queries.

## Lab 5: Simple RAG Implementation

**Objective:** Create a basic Retrieval-Augmented Generation (RAG) system with MCP.

**Prerequisites:**
- Completion of previous labs
- Basic understanding of vector embeddings
- Working knowledge of simple RAG architectures

**Steps:**

1. **Setup your environment:**

```bash
mkdir rag-mcp-server
cd rag-mcp-server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install "mcp[cli]" sentence-transformers faiss-cpu
```

2. **Create sample documents:**

Create a directory called `documents` and add several text files with content. For this example, create these three files:

`documents/ai_history.txt`:
```
The history of artificial intelligence (AI) began in the early 1950s with pioneers like Alan Turing and John McCarthy. Turing proposed the "Turing Test" as a measure of machine intelligence, while McCarthy organized the Dartmouth Conference in 1956, which is often considered the birth of AI as a field. Early AI research focused on symbolic reasoning and rule-based systems. The 1980s saw the rise of expert systems, but AI faced funding cuts during the "AI winter." Neural networks regained popularity in the 2010s with advances in deep learning, leading to breakthroughs in computer vision, natural language processing, and reinforcement learning.
```

`documents/llm_overview.txt`:
```
Large Language Models (LLMs) are advanced AI systems trained on vast amounts of text data to understand and generate human-like text. Models like GPT (Generative Pre-trained Transformer), Claude, and LLaMA represent the cutting edge of natural language processing. LLMs learn patterns and relationships in language through transformer architectures that use self-attention mechanisms. These models can perform a wide range of tasks including translation, summarization, question answering, and creative writing. However, they face challenges including hallucinations, bias, and limitations in reasoning capabilities.
```

`documents/rag_systems.txt`:
```
Retrieval-Augmented Generation (RAG) combines the generative capabilities of large language models with information retrieval systems. RAG systems work by first retrieving relevant documents from a knowledge base using semantic search, then providing these documents as context to a language model to generate more accurate, factual responses. This approach helps address hallucination problems in LLMs by grounding them in verified information. RAG typically uses vector embeddings to represent documents and queries in a shared semantic space, enabling retrieval based on meaning rather than just keyword matching.
```

3. **Create a simple RAG MCP server (rag_server.py):**

```python
import asyncio
import os
import pathlib
from typing import Dict, Any, List, Optional
import numpy as np
from mcp.server import Server
from mcp.server.stdio import stdio_server
from sentence_transformers import SentenceTransformer
import faiss

# Create a server instance
app = Server("rag-server", version="1.0.0")

# Define the documents directory
DOCS_DIR = pathlib.Path("documents").absolute()

# Initialize the embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Create a simple document store
class DocumentStore:
    def __init__(self):
        self.documents = []
        self.document_content = {}
        self.index = None
        self.embeddings = None
    
    def add_document(self, doc_id, content):
        self.documents.append(doc_id)
        self.document_content[doc_id] = content
    
    def build_index(self):
        # Generate embeddings for all documents
        texts = [self.document_content[doc_id] for doc_id in self.documents]
        self.embeddings = model.encode(texts, convert_to_numpy=True)
        
        # Build FAISS index
        dimension = self.embeddings.shape[1]
        self.index = faiss.IndexFlatL2(dimension)
        self.index.add(self.embeddings.astype(np.float32))
    
    def search(self, query, k=2):
        # Embed the query
        query_embedding = model.encode([query], convert_to_numpy=True).astype(np.float32)
        
        # Search the index
        distances, indices = self.index.search(query_embedding, k)
        
        # Return the top k documents
        results = []
        for i, idx in enumerate(indices[0]):
            if idx < len(self.documents):
                results.append({
                    "document_id": self.documents[idx],
                    "content": self.document_content[self.documents[idx]],
                    "score": float(1.0 / (1.0 + distances[0][i]))  # Convert distance to similarity score
                })
        
        return results

# Initialize and populate the document store
doc_store = DocumentStore()

# Load documents from the documents directory
def load_documents():
    for file_path in DOCS_DIR.glob("*.txt"):
        doc_id = file_path.stem
        content = file_path.read_text(encoding="utf-8")
        doc_store.add_document(doc_id, content)
    
    # Build the search index
    doc_store.build_index()
    print(f"Loaded {len(doc_store.documents)} documents and built search index")

# Document search tool
@app.tool(
    "search_documents",
    parameters={
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "The search query"
            },
            "num_results": {
                "type": "integer",
                "description": "Number of results to return (default: 2)",
                "minimum": 1,
                "maximum": 5
            }
        },
        "required": ["query"]
    }
)
async def search_documents(query: str, num_results: int = 2) -> Dict[str, Any]:
    """Search documents based on semantic similarity to the query."""
    try:
        # Limit the number of results
        num_results = max(1, min(5, num_results))
        
        # Search for relevant documents
        results = doc_store.search(query, k=num_results)
        
        return {
            "query": query,
            "results": results,
            "count": len(results)
        }
        
    except Exception as e:
        return {
            "error": f"Search failed: {str(e)}",
            "query": query,
            "results": []
        }

# List available documents tool
@app.tool("list_documents")
async def list_documents() -> Dict[str, Any]:
    """List all available documents in the system."""
    try:
        documents = []
        for doc_id in doc_store.documents:
            # Get a preview of the content (first 100 characters)
            preview = doc_store.document_content[doc_id][:100] + "..." if len(doc_store.document_content[doc_id]) > 100 else doc_store.document_content[doc_id]
            
            documents.append({
                "id": doc_id,
                "preview": preview
            })
        
        return {
            "documents": documents,
            "count": len(documents)
        }
        
    except Exception as e:
        return {
            "error": f"Failed to list documents: {str(e)}",
            "documents": []
        }

# Get document by ID tool
@app.tool("get_document")
async def get_document(document_id: str) -> Dict[str, Any]:
    """Get the full content of a specific document by ID."""
    try:
        if document_id in doc_store.document_content:
            return {
                "id": document_id,
                "content": doc_store.document_content[document_id],
                "found": True
            }
        else:
            return {
                "id": document_id,
                "content": None,
                "found": False,
                "error": f"Document '{document_id}' not found"
            }
            
    except Exception as e:
        return {
            "error": f"Failed to get document: {str(e)}",
            "id": document_id,
            "found": False
        }

# Main function to run the server
async def main():
    # Load documents and build index
    load_documents()
    
    async with stdio_server() as streams:
        await app.run(
            streams[0],
            streams[1],
            app.create_initialization_options()
        )

if __name__ == "__main__":
    asyncio.run(main())
```

4. **Create a Docker configuration:**

Create a file named `Dockerfile`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY rag_server.py .
COPY documents/ ./documents/

CMD ["python", "rag_server.py"]
```

Create a file named `requirements.txt`:

```
mcp[cli]>=0.1.0
sentence-transformers>=2.2.2
faiss-cpu>=1.7.4
```

5. **Build and run the Docker container:**

```bash
docker build -t rag-mcp-server .
docker run -i rag-mcp-server
```

6. **Configure Claude Desktop to use your server:**

Update your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "rag-server": {
      "command": "docker",
      "args": ["run", "-i", "rag-mcp-server"]
    }
  }
}
```

7. **Test your server:**

In Claude Desktop, ask questions like:
- "What documents do you have access to?"
- "Can you summarize what you know about large language models?"
- "Find information about RAG systems in your documents."
- "What were the key events in AI history according to your documents?"

**Expected Outcome:**
Claude should retrieve relevant documents based on semantic similarity to the query, and use the content to generate factually grounded responses.

## Lab 6: Business Process Automation with Slack Integration

**Objective:** Create an MCP server that integrates with Slack for business process automation.

**Prerequisites:**
- Completion of previous labs
- Slack workspace with bot permissions
- Basic understanding of OAuth and API tokens

**Steps:**

1. **Setup your environment:**

```bash
mkdir slack-mcp-server
cd slack-mcp-server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install "mcp[cli]" slack-sdk
```

2. **Create a Slack App:**

- Go to [api.slack.com/apps](https://api.slack.com/apps) and create a new app
- Under "OAuth & Permissions," add the following scopes:
  - `channels:history`
  - `channels:read`
  - `chat:write`
  - `users:read`
- Install the app to your workspace and copy the Bot User OAuth Token

3. **Create a Slack MCP server (slack_server.py):**

```python
import asyncio
import os
from datetime import datetime
from typing import Dict, Any, List, Optional
from mcp.server import Server
from mcp.server.stdio import stdio_server
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

# Create a server instance
app = Server("slack-server", version="1.0.0")

# Use the Bot User OAuth Token from your Slack app
SLACK_TOKEN = os.environ.get("SLACK_TOKEN", "xoxb-your-token-here")

# Initialize the Slack client
slack_client = WebClient(token=SLACK_TOKEN)

# Helper function to test Slack connection
def test_slack_connection():
    try:
        response = slack_client.api_test()
        print(f"Slack connection test: {response}")
        return response["ok"]
    except Exception as e:
        print(f"Slack connection test failed: {e}")
        return False

# Send message tool
@app.tool(
    "send_message",
    parameters={
        "type": "object",
        "properties": {
            "channel": {
                "type": "string",
                "description": "Channel ID or name (e.g., '#general')"
            },
            "message": {
                "type": "string",
                "description": "Message text to send"
            },
            "thread_ts": {
                "type": "string",
                "description": "Optional thread timestamp to reply in a thread"
            }
        },
        "required": ["channel", "message"]
    }
)
async def send_message(channel: str, message: str, thread_ts: Optional[str] = None) -> Dict[str, Any]:
    """Send a message to a Slack channel or thread."""
    try:
        # Prepare arguments
        args = {
            "channel": channel,
            "text": message
        }
        
        if thread_ts:
            args["thread_ts"] = thread_ts
        
        # Send the message
        response = slack_client.chat_postMessage(**args)
        
        return {
            "success": True,
            "channel": channel,
            "message_ts": response["ts"],
            "thread_ts": thread_ts
        }
        
    except SlackApiError as e:
        return {
            "success": False,
            "error": f"Failed to send message: {str(e)}",
            "channel": channel
        }

# List channels tool
@app.tool("list_channels")
async def list_channels() -> Dict[str, Any]:
    """List available Slack channels."""
    try:
        # Get the list of channels
        response = slack_client.conversations_list(types="public_channel")
        
        channels = []
        for channel in response["channels"]:
            channels.append({
                "id": channel["id"],
                "name": channel["name"],
                "topic": channel.get("topic", {}).get("value", ""),
                "member_count": channel.get("num_members", 0)
            })
        
        return {
            "channels": channels,
            "count": len(channels)
        }
        
    except SlackApiError as e:
        return {
            "success": False,
            "error": f"Failed to list channels: {str(e)}",
            "channels": []
        }

# Get channel history tool
@app.tool(
    "get_channel_history",
    parameters={
        "type": "object",
        "properties": {
            "channel": {
                "type": "string",
                "description": "Channel ID or name"
            },
            "limit": {
                "type": "integer",
                "description": "Maximum number of messages to retrieve (default: 10)",
                "minimum": 1,
                "maximum": 100
            }
        },
        "required": ["channel"]
    }
)
async def get_channel_history(channel: str, limit: int = 10) -> Dict[str, Any]:
    """Get recent message history from a Slack channel."""
    try:
        # Limit the number of messages
        limit = max(1, min(100, limit))
        
        # Get channel history
        response = slack_client.conversations_history(
            channel=channel,
            limit=limit
        )
        
        messages = []
        for msg in response["messages"]:
            # Get user info if available
            user_info = None
            if "user" in msg:
                try:
                    user_response = slack_client.users_info(user=msg["user"])
                    user_info = {
                        "id": msg["user"],
                        "name": user_response["user"]["name"],
                        "real_name": user_response["user"]["real_name"]
                    }
                except:
                    user_info = {"id": msg["user"]}
            
            # Format the message
            messages.append({
                "text": msg["text"],
                "ts": msg["ts"],
                "user": user_info,
                "has_threads": "thread_ts" in msg or "reply_count" in msg
            })
        
        return {
            "channel": channel,
            "messages": messages,
            "count": len(messages),
            "has_more": response["has_more"] if "has_more" in response else False
        }
        
    except SlackApiError as e:
        return {
            "success": False,
            "error": f"Failed to get channel history: {str(e)}",
            "channel": channel,
            "messages": []
        }

# Schedule message tool
@app.tool(
    "schedule_message",
    parameters={
        "type": "object",
        "properties": {
            "channel": {
                "type": "string",
                "description": "Channel ID or name"
            },
            "message": {
                "type": "string",
                "description": "Message text to send"
            },
            "post_at": {
                "type": "string",
                "description": "When to send the message (ISO 8601 format, e.g., '2023-12-25T10:00:00')"
            }
        },
        "required": ["channel", "message", "post_at"]
    }
)
async def schedule_message(channel: str, message: str, post_at: str) -> Dict[str, Any]:
    """Schedule a message to be sent at a specific time."""
    try:
        # Convert ISO datetime to Unix timestamp
        dt = datetime.fromisoformat(post_at)
        post_at_ts = int(dt.timestamp())
        
        # Schedule the message
        response = slack_client.chat_scheduleMessage(
            channel=channel,
            text=message,
            post_at=post_at_ts
        )
        
        return {
            "success": True,
            "channel": channel,
            "scheduled_message_id": response["scheduled_message_id"],
            "post_at": post_at
        }
        
    except ValueError as e:
        return {
            "success": False,
            "error": f"Invalid date format: {str(e)}",
            "channel": channel
        }
    except SlackApiError as e:
        return {
            "success": False,
            "error": f"Failed to schedule message: {str(e)}",
            "channel": channel
        }

# Main function to run the server
async def main():
    # Test Slack connection
    if not test_slack_connection():
        print("Failed to connect to Slack API. Please check your token.")
        return
    
    print("Successfully connected to Slack API")
    
    async with stdio_server() as streams:
        await app.run(
            streams[0],
            streams[1],
            app.create_initialization_options()
        )

if __name__ == "__main__":
    asyncio.run(main())
```

4. **Create a Docker configuration:**

Create a file named `Dockerfile`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY slack_server.py .

# Set environment variable for Slack token (replace at runtime)
ENV SLACK_TOKEN="xoxb-your-token-here"

CMD ["python", "slack_server.py"]
```

Create a file named `requirements.txt`:

```
mcp[cli]>=0.1.0
slack-sdk>=3.21.0
```

5. **Build and run the Docker container:**

```bash
docker build -t slack-mcp-server .
docker run -i -e SLACK_TOKEN=xoxb-your-actual-token slack-mcp-server
```

6. **Configure Claude Desktop to use your server:**

Update your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "slack-server": {
      "command": "docker",
      "args": ["run", "-i", "-e", "SLACK_TOKEN=xoxb-your-actual-token", "slack-mcp-server"]
    }
  }
}
```

7. **Test your server:**

In Claude Desktop, ask questions like:
- "What channels are available in our Slack workspace?"
- "Show me the recent messages in the #general channel."
- "Send a message to #announcements saying 'The quarterly report is now available.'"
- "Schedule a reminder in #team-updates for tomorrow at 9 AM to discuss the project status."

**Expected Outcome:**
Claude should interact with your Slack workspace, retrieve channel information, send messages, and schedule future messages based on your requests.