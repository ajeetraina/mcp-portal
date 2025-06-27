# Lab 4: Business Process Automation with MCP

This lab demonstrates how to create an AI-powered customer support system using MCP to integrate Claude with CRM, ticketing, and analytics services.

## Prerequisites

- Docker and Docker Compose
- Basic understanding of business workflows
- Familiarity with RESTful APIs

## Project Overview

You'll build a system that:
- Retrieves and analyzes customer support tickets
- Updates CRM records
- Generates appropriate responses
- Tracks resolution metrics

## Step 1: Project Setup

Create a directory structure for your services:

```bash
mkdir -p mcp-business-automation/{config,services/{crm,ticket-system,analytics,support-server}}
```

## Step 2: Service Implementation

For this lab, we'll implement three mock services (CRM, ticketing, analytics) and one MCP server that coordinates between them.

### Key Components

1. **CRM Service**: Stores customer information and notes
2. **Ticket System**: Manages support tickets and responses
3. **Analytics Service**: Analyzes sentiment and categorizes tickets
4. **Support Server**: Integrates all services and exposes MCP endpoints

## Step 3: Docker Compose Configuration

Create a `docker-compose.yml` file:

```yaml
version: '3'
services:
  crm:
    build: ./services/crm
    ports:
      - "5001:5001"
    volumes:
      - ./data/crm:/app
  
  ticket-system:
    build: ./services/ticket-system
    ports:
      - "5002:5002"
    volumes:
      - ./data/ticket-system:/app
  
  analytics:
    build: ./services/analytics
    ports:
      - "5003:5003"
  
  support-server:
    build: ./services/support-server
    ports:
      - "5000:5000"
    depends_on:
      - crm
      - ticket-system
      - analytics
  
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
      - support-server
```

## Step 4: MCP Server Configuration

Create a `config/tools.json` file:

```json
{
  "tools": [
    {
      "name": "support",
      "service": "support-server:5000",
      "description": "Manages customer support tickets, including retrieving ticket details, analyzing sentiment, responding to tickets, and updating status",
      "schema": {
        "type": "object",
        "functions": [
          {
            "name": "handle_ticket",
            "description": "Retrieve and analyze a customer support ticket",
            "parameters": {
              "type": "object",
              "properties": {
                "ticket_id": {
                  "type": "string",
                  "description": "ID of the ticket to retrieve and analyze"
                }
              },
              "required": ["ticket_id"]
            },
            "path": "/support/handle-ticket"
          },
          {
            "name": "respond_to_ticket",
            "description": "Add a response to a ticket and optionally update its status",
            "parameters": {
              "type": "object",
              "properties": {
                "ticket_id": {
                  "type": "string",
                  "description": "ID of the ticket to respond to"
                },
                "response": {
                  "type": "string",
                  "description": "The response text to add to the ticket"
                },
                "update_status": {
                  "type": "string",
                  "enum": ["open", "in_progress", "resolved", "closed"],
                  "description": "Optionally update the ticket status"
                },
                "add_customer_note": {
                  "type": "boolean",
                  "description": "Whether to add a note to the customer's CRM record",
                  "default": false
                }
              },
              "required": ["ticket_id", "response"]
            },
            "path": "/support/respond-to-ticket"
          }
        ]
      }
    }
  ]
}
```

## Step 5: Support Server Implementation

Create a `services/support-server/app.py` file (key sections):

```python
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Service URLs
CRM_URL = "http://crm:5001"
TICKET_URL = "http://ticket-system:5002"
ANALYTICS_URL = "http://analytics:5003"

@app.route('/support/handle-ticket', methods=['POST'])
def handle_ticket():
    data = request.json
    ticket_id = data.get('ticket_id')
    
    # Get ticket details
    ticket_response = requests.get(f"{TICKET_URL}/tickets/{ticket_id}")
    ticket = ticket_response.json()
    
    # Get customer details
    customer_id = ticket.get('customer_id')
    customer_response = requests.get(f"{CRM_URL}/customers/{customer_id}")
    customer = customer_response.json()
    
    # Analyze sentiment
    sentiment_response = requests.post(
        f"{ANALYTICS_URL}/analyze/sentiment", 
        json={"text": ticket.get('description', '')}
    )
    sentiment_data = sentiment_response.json()
    
    # Categorize ticket
    category_response = requests.post(
        f"{ANALYTICS_URL}/analyze/categorize", 
        json={"text": ticket.get('description', '')}
    )
    category_data = category_response.json()
    
    # Return combined data
    return jsonify({
        "ticket": ticket,
        "customer": customer,
        "analysis": {
            "sentiment": sentiment_data.get("sentiment"),
            "category": category_data.get("primary_category")
        }
    })

@app.route('/support/respond-to-ticket', methods=['POST'])
def respond_to_ticket():
    data = request.json
    ticket_id = data.get('ticket_id')
    response_text = data.get('response')
    update_status = data.get('update_status')
    add_customer_note = data.get('add_customer_note', False)
    
    # Add response to ticket
    requests.post(
        f"{TICKET_URL}/tickets/{ticket_id}/respond", 
        json={"response": response_text}
    )
    
    # Update ticket status if requested
    if update_status:
        requests.put(
            f"{TICKET_URL}/tickets/{ticket_id}/status",
            json={"status": update_status}
        )
    
    # Add note to customer CRM if requested
    if add_customer_note:
        # Get customer_id from ticket
        ticket_response = requests.get(f"{TICKET_URL}/tickets/{ticket_id}")
        ticket = ticket_response.json()
        customer_id = ticket.get('customer_id')
        
        # Add note
        note = f"Ticket {ticket_id} - Response: {response_text[:100]}..."
        requests.post(
            f"{CRM_URL}/customers/{customer_id}/notes",
            json={"note": note}
        )
    
    return jsonify({"success": True})
```

## Step 6: Testing the Workflow

Create a simple test script:

```python
import requests
import json

API_KEY = "your_claude_api_key"
MCP_URL = "http://localhost:8080/v1/messages"

headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

# First, get the ticket details and analysis
conversation = {
    "model": "claude-3-opus-20240229",
    "messages": [
        {"role": "user", "content": "Can you help me handle customer support ticket TKT-1001? Analyze it and draft a response."}
    ],
    "tools": [
        {
            "name": "support",
            "description": "Manages customer support tickets, including retrieving ticket details, analyzing sentiment, responding to tickets, and updating status"
        }
    ]
}

response = requests.post(MCP_URL, headers=headers, json=conversation)
result = response.json()
print(json.dumps(result, indent=2))
```

## Step 7: Example Workflow

1. Claude calls the `handle_ticket` function to retrieve ticket details, customer information, and analysis
2. Claude generates an appropriate response based on the ticket type and sentiment
3. Claude calls the `respond_to_ticket` function to post the response and update the ticket status
4. The support server coordinates between the CRM, ticketing, and analytics services

## Business Applications

This automated customer support system demonstrates how MCP enables AI to:

1. **Reduce Response Time**: Automate first-level support responses
2. **Ensure Consistency**: Apply the same high-quality standards to all tickets
3. **Knowledge Integration**: Pull information from multiple business systems
4. **Intelligent Routing**: Categorize and route complex issues to specialists
5. **Data-Driven Insights**: Track sentiment and resolution metrics over time

## Next Steps

- Integrate with real CRM systems like Salesforce or HubSpot
- Add knowledge base search functionality
- Implement ticket prioritization algorithms
- Create a notification system for unresolved tickets
- Build a dashboard to visualize support metrics
