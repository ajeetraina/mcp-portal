# Lab 5: Retrieval-Augmented Generation with MCP

This lab demonstrates how to build a document question-answering system using Retrieval-Augmented Generation (RAG) with MCP. You'll create a system that allows Claude to access and query a vector database of documents.

## Prerequisites

- Docker and Docker Compose
- Basic understanding of vector databases and embeddings
- Familiarity with RAG architecture

## Introduction

Retrieval-Augmented Generation (RAG) is a powerful technique that enhances language models by retrieving relevant information from external knowledge sources. In this lab, you'll build a complete RAG system using MCP that allows Claude to answer questions about technical documentation.

## Step 1: Project Setup

Create a new project directory:

```bash
mkdir mcp-rag-system
cd mcp-rag-system
mkdir -p config data/documents services/document-store services/rag-server
```

## Step 2: Setting Up the Vector Database

We'll use Chroma, a lightweight vector database, for this project.

Create a service for document ingestion and retrieval in `services/document-store/app.py`:

```python
from flask import Flask, request, jsonify
import chromadb
import os
import hashlib
import uuid
import numpy as np
import json
import logging
from chromadb.utils import embedding_functions

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

# Set up ChromaDB
client = chromadb.PersistentClient(path="/data")

# Use OpenAI embedding function
openai_ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key=os.environ.get("OPENAI_API_KEY"),
    model_name="text-embedding-3-small"
)

# Create or get the collection
collection = client.get_or_create_collection(
    name="documents",
    embedding_function=openai_ef,
    metadata={"hnsw:space": "cosine"}
)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

@app.route('/documents', methods=['POST'])
def add_document():
    data = request.json
    
    if 'text' not in data or not data['text'].strip():
        return jsonify({"error": "Document text is required"}), 400
    
    doc_text = data['text']
    doc_title = data.get('title', 'Untitled Document')
    doc_metadata = data.get('metadata', {})
    
    # Create chunks from the document (simple implementation)
    chunks = create_chunks(doc_text, chunk_size=1000, overlap=200)
    
    # Generate a document ID if not provided
    doc_id = data.get('id', str(uuid.uuid4()))
    
    # Add chunks to the vector store
    ids = []
    documents = []
    metadatas = []
    
    for i, chunk in enumerate(chunks):
        chunk_id = f"{doc_id}_chunk_{i}"
        chunk_metadata = {
            "document_id": doc_id,
            "document_title": doc_title,
            "chunk_index": i,
            "chunk_count": len(chunks),
            **doc_metadata
        }
        
        ids.append(chunk_id)
        documents.append(chunk)
        metadatas.append(chunk_metadata)
    
    # Add to the collection
    collection.add(
        ids=ids,
        documents=documents,
        metadatas=metadatas
    )
    
    return jsonify({
        "success": True,
        "document_id": doc_id,
        "chunks": len(chunks)
    })

@app.route('/documents/<document_id>', methods=['DELETE'])
def delete_document(document_id):
    # Get all chunks for this document
    results = collection.get(
        where={"document_id": document_id}
    )
    
    if not results or len(results['ids']) == 0:
        return jsonify({"error": "Document not found"}), 404
    
    # Delete all chunks
    collection.delete(
        where={"document_id": document_id}
    )
    
    return jsonify({
        "success": True,
        "document_id": document_id,
        "chunks_deleted": len(results['ids'])
    })

@app.route('/documents', methods=['GET'])
def list_documents():
    # Get all documents (grouped by document_id)
    results = collection.get()
    
    if not results or len(results['metadatas']) == 0:
        return jsonify({"documents": []})
    
    # Group by document_id
    documents = {}
    for i, metadata in enumerate(results['metadatas']):
        doc_id = metadata.get('document_id', 'unknown')
        if doc_id not in documents:
            documents[doc_id] = {
                "id": doc_id,
                "title": metadata.get('document_title', 'Untitled'),
                "chunk_count": metadata.get('chunk_count', 0),
                "metadata": {k: v for k, v in metadata.items() 
                            if k not in ['document_id', 'document_title', 'chunk_index', 'chunk_count']}
            }
    
    return jsonify({"documents": list(documents.values())})

@app.route('/query', methods=['POST'])
def query_documents():
    data = request.json
    
    if 'query' not in data or not data['query'].strip():
        return jsonify({"error": "Query text is required"}), 400
    
    query_text = data['query']
    num_results = data.get('num_results', 3)
    
    # Optional filters
    where_clause = data.get('filters', {})
    
    # Query the collection
    results = collection.query(
        query_texts=[query_text],
        n_results=num_results,
        where=where_clause
    )
    
    # Format results
    formatted_results = []
    if results['documents'] and len(results['documents'][0]) > 0:
        for i, doc in enumerate(results['documents'][0]):
            formatted_results.append({
                "text": doc,
                "metadata": results['metadatas'][0][i],
                "distance": results['distances'][0][i] if 'distances' in results else None,
                "id": results['ids'][0][i]
            })
    
    return jsonify({
        "results": formatted_results,
        "query": query_text
    })

def create_chunks(text, chunk_size=1000, overlap=200):
    """Simple text chunking by characters with overlap."""
    if len(text) <= chunk_size:
        return [text]
    
    chunks = []
    start = 0
    
    while start < len(text):
        # Find the end of the chunk
        end = min(start + chunk_size, len(text))
        
        # If not at the end of the text, try to find a good breaking point
        if end < len(text):
            # Look for paragraph breaks first
            paragraph_break = text.rfind('\n\n', start, end)
            if paragraph_break != -1 and paragraph_break > start + chunk_size / 2:
                end = paragraph_break + 2
            else:
                # Look for sentence breaks
                sentence_break = text.rfind('. ', start, end)
                if sentence_break != -1 and sentence_break > start + chunk_size / 2:
                    end = sentence_break + 2
                else:
                    # Look for word breaks
                    word_break = text.rfind(' ', start, end)
                    if word_break != -1:
                        end = word_break + 1
        
        chunks.append(text[start:end])
        start = end - overlap
    
    return chunks

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
```

Create a Dockerfile for the document store:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

RUN pip install flask==2.0.1 chromadb==0.4.18 openai==1.3.0

COPY app.py .

EXPOSE 5001

CMD ["python", "app.py"]
```

## Step 3: Creating the RAG Server

Now, let's create the RAG server that will integrate with MCP in `services/rag-server/app.py`:

```python
from flask import Flask, request, jsonify
import requests
import logging
import os
from datetime import datetime

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

# Document store URL
DOCUMENT_STORE_URL = "http://document-store:5001"

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

@app.route('/rag/query', methods=['POST'])
def rag_query():
    data = request.json
    query = data.get('query', '')
    num_results = data.get('num_results', 3)
    filters = data.get('filters', {})
    
    if not query:
        return jsonify({"error": "Query is required"}), 400
    
    # Query the document store
    response = requests.post(
        f"{DOCUMENT_STORE_URL}/query",
        json={
            "query": query,
            "num_results": num_results,
            "filters": filters
        }
    )
    
    if response.status_code != 200:
        return jsonify({
            "error": f"Error querying document store: {response.text}"
        }), response.status_code
    
    results = response.json()
    
    # Format the context from retrieved documents
    context = ""
    for i, result in enumerate(results.get('results', [])):
        metadata = result.get('metadata', {})
        doc_title = metadata.get('document_title', 'Untitled')
        context += f"\n\nDocument: {doc_title}\n"
        context += f"Excerpt {i+1}:\n{result.get('text', '')}\n"
    
    if not context:
        context = "No relevant documents found for this query."
    
    # Return the formatted context and original results
    return jsonify({
        "context": context,
        "raw_results": results.get('results', []),
        "query": query
    })

@app.route('/rag/documents', methods=['GET'])
def list_documents():
    response = requests.get(f"{DOCUMENT_STORE_URL}/documents")
    if response.status_code != 200:
        return jsonify({
            "error": f"Error listing documents: {response.text}"
        }), response.status_code
    
    return jsonify(response.json())

@app.route('/rag/documents', methods=['POST'])
def add_document():
    data = request.json
    
    # Forward to document store
    response = requests.post(
        f"{DOCUMENT_STORE_URL}/documents",
        json=data
    )
    
    if response.status_code != 200:
        return jsonify({
            "error": f"Error adding document: {response.text}"
        }), response.status_code
    
    return jsonify(response.json())

@app.route('/rag/documents/<document_id>', methods=['DELETE'])
def delete_document(document_id):
    response = requests.delete(f"{DOCUMENT_STORE_URL}/documents/{document_id}")
    
    if response.status_code != 200:
        return jsonify({
            "error": f"Error deleting document: {response.text}"
        }), response.status_code
    
    return jsonify(response.json())

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

Create a Dockerfile for the RAG server:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

RUN pip install flask==2.0.1 requests==2.26.0

COPY app.py .

EXPOSE 5000

CMD ["python", "app.py"]
```

## Step 4: Setting Up Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3'
services:
  document-store:
    build: ./services/document-store
    ports:
      - "5001:5001"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./data:/data
  
  rag-server:
    build: ./services/rag-server
    ports:
      - "5000:5000"
    depends_on:
      - document-store
  
  mcp-proxy:
    image: anthropic/mcp-proxy:latest
    ports:
      - "8080:8080"
    environment:
      - MCP_API_KEY=${MCP_API_KEY}
      - CLAUDE_API_KEY=${CLAUDE_API_KEY}
    volumes:
      - ./config:/app/config
    depends_on:
      - rag-server
```

## Step 5: Creating the MCP Configuration

Create a `config/tools.json` file:

```json
{
  "tools": [
    {
      "name": "rag",
      "service": "rag-server:5000",
      "description": "A retrieval-augmented generation system that allows querying a knowledge base of documents",
      "schema": {
        "type": "object",
        "functions": [
          {
            "name": "query",
            "description": "Query the document store with a question to retrieve relevant document sections",
            "parameters": {
              "type": "object",
              "properties": {
                "query": {
                  "type": "string",
                  "description": "The question or query to search for in the document database"
                },
                "num_results": {
                  "type": "integer",
                  "description": "Number of relevant document chunks to retrieve (default: 3)",
                  "default": 3
                },
                "filters": {
                  "type": "object",
                  "description": "Optional filters to narrow down document search (e.g., by document_title, document_id, etc.)",
                  "additionalProperties": true
                }
              },
              "required": ["query"]
            },
            "path": "/rag/query"
          },
          {
            "name": "list_documents",
            "description": "List all available documents in the knowledge base",
            "parameters": {
              "type": "object",
              "properties": {}
            },
            "path": "/rag/documents"
          },
          {
            "name": "add_document",
            "description": "Add a new document to the knowledge base",
            "parameters": {
              "type": "object",
              "properties": {
                "text": {
                  "type": "string",
                  "description": "The full text content of the document"
                },
                "title": {
                  "type": "string",
                  "description": "The title of the document"
                },
                "metadata": {
                  "type": "object",
                  "description": "Optional metadata about the document (e.g., author, date, category)",
                  "additionalProperties": true
                }
              },
              "required": ["text", "title"]
            },
            "path": "/rag/documents"
          },
          {
            "name": "delete_document",
            "description": "Delete a document from the knowledge base",
            "parameters": {
              "type": "object",
              "properties": {
                "document_id": {
                  "type": "string",
                  "description": "The ID of the document to delete"
                }
              },
              "required": ["document_id"]
            },
            "path": "/rag/documents/{document_id}"
          }
        ]
      }
    }
  ]
}
```

## Step 6: Sample Documents

Create a few sample documents in your `data/documents` directory. For example, create a file called `docker_documentation.txt` with Docker documentation.

## Step 7: Running the System

Start the services:

```bash
export OPENAI_API_KEY=your_openai_api_key
export MCP_API_KEY=your_mcp_api_key
export CLAUDE_API_KEY=your_claude_api_key
docker-compose up --build
```

## Step 8: Adding Documents

Create a Python script to add your sample documents:

```python
import requests
import os

# Function to add a document from a text file
def add_document_from_file(file_path):
    with open(file_path, 'r') as f:
        text = f.read()
    
    # Extract title from filename
    title = os.path.basename(file_path).replace('_', ' ').replace('.txt', '')
    
    # Send to the RAG server
    response = requests.post(
        "http://localhost:5000/rag/documents",
        json={
            "text": text,
            "title": title,
            "metadata": {
                "source": "local_file",
                "filename": os.path.basename(file_path)
            }
        }
    )
    
    return response.json()

# Add each document in the data/documents directory
document_dir = "data/documents"
for filename in os.listdir(document_dir):
    if filename.endswith(".txt"):
        file_path = os.path.join(document_dir, filename)
        result = add_document_from_file(file_path)
        print(f"Added document {filename}: {result}")
```

## Step 9: Testing with MCP

Create a test script to query the RAG system via MCP:

```python
import requests
import json

API_KEY = "your_claude_api_key"
MCP_URL = "http://localhost:8080/v1/messages"

headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

# First, check what documents are available
conversation1 = {
    "model": "claude-3-opus-20240229",
    "messages": [
        {"role": "user", "content": "What documents do we have in our knowledge base?"}
    ],
    "tools": [
        {
            "name": "rag",
            "description": "A retrieval-augmented generation system that allows querying a knowledge base of documents"
        }
    ]
}

print("Checking available documents...")
response1 = requests.post(MCP_URL, headers=headers, json=conversation1)
result1 = response1.json()
print(json.dumps(result1, indent=2))

# Now, query the documents
conversation2 = {
    "model": "claude-3-opus-20240229",
    "messages": [
        {"role": "user", "content": "How do I run a Docker container?"}
    ],
    "tools": [
        {
            "name": "rag",
            "description": "A retrieval-augmented generation system that allows querying a knowledge base of documents"
        }
    ]
}

print("\nQuerying the knowledge base...")
response2 = requests.post(MCP_URL, headers=headers, json=conversation2)
result2 = response2.json()
print(json.dumps(result2, indent=2))
```

## What You've Built

You've created a complete RAG system that:

1. Stores documents in a vector database (ChromaDB)
2. Chunks and embeds documents for semantic search
3. Retrieves relevant context based on user queries
4. Integrates with Claude through MCP

This enables Claude to answer questions based on your specific documents, extending its capabilities beyond its training data.

## Next Steps

- Add support for different document types (PDF, HTML, etc.)
- Implement document version control
- Add citation tracking to include sources in responses
- Create a proper chunking strategy based on semantic boundaries
- Build a user interface for document management
- Add support for filtering by document metadata
- Implement hybrid search (semantic + keyword)
