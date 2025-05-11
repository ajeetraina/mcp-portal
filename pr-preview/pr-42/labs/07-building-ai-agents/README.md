# Lab 7: Building Autonomous AI Agents with MCP

This lab demonstrates how to build autonomous AI agents with MCP that can accomplish complex tasks over multiple steps by using a variety of tools.

## Prerequisites

- Docker and Docker Compose installed
- Basic understanding of AI agents and tool use
- Familiarity with Python programming

## Introduction

Autonomous AI agents leverage language models to accomplish complex tasks by breaking them down into steps and using appropriate tools. In this lab, you'll build an agent system using MCP that can:

1. Handle multi-step planning for complex tasks
2. Use a variety of tools to gather information and take actions
3. Maintain state and memory between interactions
4. Execute workflows without requiring human intervention for each step

## Project Architecture

The agent system consists of several microservices:

1. **Memory Service**: Stores and retrieves agent memories
2. **Tools Service**: Provides various tools for the agent to use (weather, calculator, web search, todo list)
3. **Planner Service**: Creates plans for completing tasks
4. **Executor Service**: Executes plan steps using appropriate tools
5. **Agent Server**: Coordinates the other services and interfaces with Claude through MCP

## Step 1: Project Setup

Create a new project directory:

```bash
mkdir mcp-agents
cd mcp-agents
mkdir -p config services/{planner,memory,tools,executor,agent-server} data/{memories,logs,todos}
```

## Step 2: Creating the Memory Service

First, let's create a service to store and retrieve agent memories in `services/memory/app.py`.

The Memory Service provides:
- Short-term memory for recent interactions
- Long-term memory for persistent information
- Memory retrieval by agent ID
- Memory clearing functionality

## Step 3: Creating the Tool Service

Next, let's create a service for various tools the agent can use in `services/tools/app.py`.

The Tool Service provides:
- Web search (simulated)
- Calculator for math expressions
- Weather information (simulated)
- Todo list management

## Step 4: Creating the Planner Service

Now, let's create a planning service that helps the agent break down tasks in `services/planner/app.py`.

The Planner Service:
- Analyzes the task description
- Creates a step-by-step plan 
- Determines which tools to use at each step
- Provides parameters for tool use

## Step 5: Creating the Executor Service

Let's create an executor service that runs the agent's plans in `services/executor/app.py`.

The Executor Service:
- Executes individual plan steps
- Calls appropriate tools with parameters
- Tracks execution progress
- Stores results in memory

## Step 6: Creating the Agent Server

Create a central server for the agent in `services/agent-server/app.py`:

```python
from flask import Flask, request, jsonify
import requests
import logging
import json
import os
import uuid
from datetime import datetime

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

# Service URLs
MEMORY_URL = "http://memory:5001"
PLANNER_URL = "http://planner:5003"
EXECUTOR_URL = "http://executor:5004"

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

@app.route('/agent/initialize', methods=['POST'])
def initialize_agent():
    data = request.json
    agent_id = data.get('agent_id', str(uuid.uuid4()))
    agent_name = data.get('agent_name', 'AI Assistant')
    
    try:
        # Initialize agent memory
        memory_response = requests.post(
            f"{MEMORY_URL}/memory/add",
            json={
                "agent_id": agent_id,
                "memory_item": {
                    "agent_name": agent_name,
                    "initialization_time": datetime.now().isoformat(),
                    "system_info": "Agent initialized successfully"
                },
                "memory_type": "long_term",
                "key": "agent_info"
            }
        )
        
        if memory_response.status_code != 200:
            return jsonify({"error": f"Error initializing agent memory: {memory_response.text}"}), 500
        
        return jsonify({
            "agent_id": agent_id,
            "agent_name": agent_name,
            "status": "initialized",
            "initialization_time": datetime.now().isoformat()
        })
    
    except Exception as e:
        app.logger.error(f"Error initializing agent: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/agent/process', methods=['POST'])
def process_task():
    data = request.json
    agent_id = data.get('agent_id')
    task = data.get('task')
    
    if not agent_id or not task:
        return jsonify({"error": "agent_id and task are required"}), 400
    
    try:
        # Store the task in memory
        requests.post(
            f"{MEMORY_URL}/memory/add",
            json={
                "agent_id": agent_id,
                "memory_item": {
                    "task": task,
                    "timestamp": datetime.now().isoformat()
                },
                "memory_type": "short_term"
            }
        )
        
        # Execute the task
        executor_response = requests.post(
            f"{EXECUTOR_URL}/executor/execute-plan",
            json={
                "agent_id": agent_id,
                "task": task
            }
        )
        
        if executor_response.status_code != 200:
            return jsonify({"error": f"Error executing task: {executor_response.text}"}), 500
        
        execution_result = executor_response.json()
        
        # Format the response
        response = {
            "agent_id": agent_id,
            "task": task,
            "status": execution_result.get('status', 'unknown'),
            "plan": execution_result.get('plan'),
            "results": execution_result.get('results', []),
            "timestamp": datetime.now().isoformat()
        }
        
        # Store the response in memory
        requests.post(
            f"{MEMORY_URL}/memory/add",
            json={
                "agent_id": agent_id,
                "memory_item": response,
                "memory_type": "short_term"
            }
        )
        
        return jsonify(response)
    
    except Exception as e:
        app.logger.error(f"Error processing task: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/agent/memory', methods=['POST'])
def get_agent_memory():
    data = request.json
    agent_id = data.get('agent_id')
    
    if not agent_id:
        return jsonify({"error": "agent_id is required"}), 400
    
    try:
        memory_response = requests.post(
            f"{MEMORY_URL}/memory/get",
            json={"agent_id": agent_id}
        )
        
        if memory_response.status_code != 200:
            return jsonify({"error": f"Error retrieving memory: {memory_response.text}"}), 500
        
        memory = memory_response.json()
        
        return jsonify({
            "agent_id": agent_id,
            "memory": memory
        })
    
    except Exception as e:
        app.logger.error(f"Error getting agent memory: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/agent/continue', methods=['POST'])
def continue_execution():
    data = request.json
    agent_id = data.get('agent_id')
    plan = data.get('plan')
    step_number = data.get('step_number')
    reasoning = data.get('reasoning')
    
    if not agent_id or not plan or not step_number:
        return jsonify({"error": "agent_id, plan, and step_number are required"}), 400
    
    try:
        # Store the reasoning in memory
        if reasoning:
            requests.post(
                f"{MEMORY_URL}/memory/add",
                json={
                    "agent_id": agent_id,
                    "memory_item": {
                        "step": step_number,
                        "reasoning": reasoning,
                        "timestamp": datetime.now().isoformat()
                    },
                    "memory_type": "short_term"
                }
            )
        
        # Continue execution
        executor_response = requests.post(
            f"{EXECUTOR_URL}/executor/execute-step",
            json={
                "agent_id": agent_id,
                "plan": plan,
                "step_number": step_number + 1
            }
        )
        
        if executor_response.status_code != 200:
            return jsonify({"error": f"Error continuing execution: {executor_response.text}"}), 500
        
        execution_result = executor_response.json()
        
        # Format the response
        response = {
            "agent_id": agent_id,
            "plan": plan,
            "step_number": step_number + 1,
            "status": execution_result.get('status', 'unknown'),
            "result": execution_result.get('result'),
            "next_step": execution_result.get('next_step'),
            "timestamp": datetime.now().isoformat()
        }
        
        return jsonify(response)
    
    except Exception as e:
        app.logger.error(f"Error continuing execution: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

Create a Dockerfile in `services/agent-server/Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

RUN pip install flask==2.0.1 requests==2.28.2

COPY app.py .

EXPOSE 5000

CMD ["python", "app.py"]
```

## Step 7: Creating MCP Configuration

Create a `config/tools.json` file to connect MCP with the agent:

```json
{
  "tools": [
    {
      "name": "agent",
      "service": "agent-server:5000",
      "description": "An autonomous AI agent that can accomplish complex tasks by using tools and maintaining memory",
      "schema": {
        "type": "object",
        "functions": [
          {
            "name": "initialize",
            "description": "Initialize a new agent with an ID and name",
            "parameters": {
              "type": "object",
              "properties": {
                "agent_id": {
                  "type": "string",
                  "description": "Optional ID for the agent (one will be generated if not provided)"
                },
                "agent_name": {
                  "type": "string",
                  "description": "Name for the agent",
                  "default": "AI Assistant"
                }
              }
            },
            "path": "/agent/initialize"
          },
          {
            "name": "process_task",
            "description": "Process a task with the agent",
            "parameters": {
              "type": "object",
              "properties": {
                "agent_id": {
                  "type": "string",
                  "description": "ID of the agent"
                },
                "task": {
                  "type": "string",
                  "description": "Task to process"
                }
              },
              "required": ["agent_id", "task"]
            },
            "path": "/agent/process"
          },
          {
            "name": "get_memory",
            "description": "Get the memory of an agent",
            "parameters": {
              "type": "object",
              "properties": {
                "agent_id": {
                  "type": "string",
                  "description": "ID of the agent"
                }
              },
              "required": ["agent_id"]
            },
            "path": "/agent/memory"
          },
          {
            "name": "continue_execution",
            "description": "Continue execution of a plan after reasoning",
            "parameters": {
              "type": "object",
              "properties": {
                "agent_id": {
                  "type": "string",
                  "description": "ID of the agent"
                },
                "plan": {
                  "type": "object",
                  "description": "The plan to continue executing"
                },
                "step_number": {
                  "type": "integer",
                  "description": "The current step number"
                },
                "reasoning": {
                  "type": "string",
                  "description": "The reasoning for the current step"
                }
              },
              "required": ["agent_id", "plan", "step_number"]
            },
            "path": "/agent/continue"
          }
        ]
      }
    }
  ]
}
```

## Step 8: Starting the System

Start all services with Docker Compose:

```bash
export MCP_API_KEY=your_mcp_api_key
export CLAUDE_API_KEY=your_claude_api_key
docker-compose up --build
```

## Step 9: Testing the Agent

Create a Python script to test your agent with Claude:

```python
import requests
import json
import time

API_KEY = "your_claude_api_key"
MCP_URL = "http://localhost:8080/v1/messages"

headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

# Initialize an agent
conversation1 = {
    "model": "claude-3-opus-20240229",
    "messages": [
        {"role": "user", "content": "Can you initialize an AI agent to help me with various tasks?"}
    ],
    "tools": [
        {
            "name": "agent",
            "description": "An autonomous AI agent that can accomplish complex tasks by using tools and maintaining memory"
        }
    ]
}

print("Initializing agent...")
response1 = requests.post(MCP_URL, headers=headers, json=conversation1)
result1 = response1.json()
print(json.dumps(result1["content"][0]["text"], indent=2))

# Extract agent_id from the response
response_text = result1["content"][0]["text"]
import re
agent_id_match = re.search(r'agent_id:\s*"([^"]+)"', response_text)
if agent_id_match:
    agent_id = agent_id_match.group(1)
else:
    print("Could not find agent_id in response")
    exit(1)

print(f"Extracted agent_id: {agent_id}")

# Give the agent a task
conversation2 = {
    "model": "claude-3-opus-20240229",
    "messages": [
        {"role": "user", "content": "Can you initialize an AI agent to help me with various tasks?"},
        {"role": "assistant", "content": response_text},
        {"role": "user", "content": f"Great! Now ask the agent with ID {agent_id} to check the weather in New York."}
    ],
    "tools": [
        {
            "name": "agent",
            "description": "An autonomous AI agent that can accomplish complex tasks by using tools and maintaining memory"
        }
    ]
}

print("\nProcessing weather task...")
response2 = requests.post(MCP_URL, headers=headers, json=conversation2)
result2 = response2.json()
print(json.dumps(result2["content"][0]["text"], indent=2))

# Add a todo item
conversation3 = {
    "model": "claude-3-opus-20240229",
    "messages": [
        {"role": "user", "content": "Can you initialize an AI agent to help me with various tasks?"},
        {"role": "assistant", "content": response_text},
        {"role": "user", "content": f"Great! Now ask the agent with ID {agent_id} to check the weather in New York."},
        {"role": "assistant", "content": result2["content"][0]["text"]},
        {"role": "user", "content": f"Now ask the agent to add 'Buy groceries' to my todo list."}
    ],
    "tools": [
        {
            "name": "agent",
            "description": "An autonomous AI agent that can accomplish complex tasks by using tools and maintaining memory"
        }
    ]
}

print("\nAdding todo item...")
response3 = requests.post(MCP_URL, headers=headers, json=conversation3)
result3 = response3.json()
print(json.dumps(result3["content"][0]["text"], indent=2))

# Check the agent's memory
conversation4 = {
    "model": "claude-3-opus-20240229",
    "messages": [
        {"role": "user", "content": f"Please check what's in the agent's memory. Use agent_id: {agent_id}"}
    ],
    "tools": [
        {
            "name": "agent",
            "description": "An autonomous AI agent that can accomplish complex tasks by using tools and maintaining memory"
        }
    ]
}

print("\nChecking agent memory...")
response4 = requests.post(MCP_URL, headers=headers, json=conversation4)
result4 = response4.json()
print(json.dumps(result4["content"][0]["text"], indent=2))
```

## How the Agent Works

1. **Initialization**: Claude initializes the agent with a unique ID
2. **Task Processing**:
   - User sends a task to the agent
   - Agent breaks down the task into steps
   - Agent executes each step using appropriate tools
   - Agent reports results back to the user
3. **Reasoning**: For steps that require reasoning, Claude provides the analysis
4. **Memory**: The agent stores all interactions and results in memory

## Agent Capabilities

With this architecture, the agent can:

1. **Weather Information**: Check weather conditions for any location
2. **Todo List Management**: Add, update, list, and delete tasks
3. **Web Search**: Find information on various topics
4. **Calculations**: Perform mathematical calculations
5. **Memory**: Remember previous interactions and tasks
6. **Planning**: Break down complex tasks into manageable steps

## Business Applications

AI agents can be applied to numerous business scenarios:

1. **Customer Service**: Create agents that handle customer inquiries and perform tasks
2. **Personal Assistants**: Build assistants that manage calendars, emails, and to-do lists
3. **Data Analysis**: Deploy agents that collect, process, and analyze data
4. **Research**: Create agents that gather information from multiple sources
5. **Process Automation**: Automate complex business processes with multiple steps
6. **Scheduling**: Build agents that coordinate meetings and appointments
7. **Project Management**: Create agents that track tasks and deadlines

## Next Steps

- Add more sophisticated tools (email, calendar, notes)
- Implement more advanced planning using an LLM instead of rule-based planning
- Add authentication and user management
- Create a web interface for interacting with agents
- Implement agent collaboration (multiple agents working together)
- Add learning capabilities so agents improve over time
- Implement more complex reasoning and decision-making
