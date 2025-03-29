---
layout: lab
title: "Lab 1: First Steps with Docker & MCP Servers"
description: In this beginner-friendly hands-on lab, you'll set up your first MCP servers with Docker and learn to interact with them using Gordon AI.
difficulty: Beginner
time: 30 minutes
author: Docker Team
last_updated: March 18, 2025
next_lab: /docs/labs/research-assistant-lab
---

## 🧾 Prerequisites

- The latest version of Docker Desktop installed  
- Enable Docker AI

Under Docker Dashboard > Settings > Experimental Feature > Enable Docker AI

<img width="1347" alt="image" src="https://github.com/user-attachments/assets/cb1255ef-9ba8-4d65-bded-b9525267e202" />


---

## 🎯 Learning Objectives

1. Set up multiple MCP servers using Docker Compose  
2. Configure proper filesystem mounts and permissions  
3. Interact with MCP servers using Gordon AI  
4. Understand how MCP servers communicate with AI assistants  

---

## ▶️ Step 1: Create Your Lab Environment

First, create a new directory for your lab:

```bash
mkdir mcp-lab1
cd mcp-lab1
```

Create a new file called `data.txt` with some sample content:

```bash
echo "This is sample text for our MCP lab experiment. The Docker MCP integration is awesome!" > data.txt
```

---

## 🖥️ Step 2: Set Up Your First MCP Servers

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

---

## 🤖 Step 3: Interact with Your MCP Servers

Now let's test our setup with some questions for Gordon AI:

```bash
# Ask a time-related question
docker ai "What time is it now in New York, Tokyo, and London? Show the date too."

# Ask a question that requires filesystem access
docker ai "What's in the data.txt file? Count the words and tell me how many there are."
```

You should see Gordon AI accessing the appropriate MCP servers to answer your questions.

> 💡 **Tip**  
> If you don't see any indication that Gordon is using the MCP servers, verify that your `gordon-mcp.yml` file is in the current directory and that Docker Desktop is running.

---

## ➕ Step 4: Extend Your MCP Configuration

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

---

## 🔍 Step 5: Examine Container Operations

While Gordon is handling your requests, you can observe how Docker manages these MCP servers:

```bash
# List running containers
docker ps

# View logs from a specific MCP server
docker logs mcp-fetch
```

Notice how containers are created and managed as needed for each interaction.

---

## ℹ️ Understanding What's Happening

When you run `docker ai` with your `gordon-mcp.yml` configuration:

1. Gordon checks the `gordon-mcp.yml` file to discover available MCP servers  
2. When needed, Gordon starts the required MCP server containers  
3. Gordon sends requests to the appropriate MCP servers based on your query  
4. MCP servers process the requests and return results to Gordon  
5. Gordon uses this context to formulate a comprehensive response  

---

## 🧪 Experiment on Your Own

Try these additional exercises:

1. Create a more complex file structure and ask Gordon to navigate and summarize it  
2. Ask Gordon to combine information from multiple sources (time + web content)  
3. Try modifying the filesystem mount to restrict access to only certain directories  

> 💡 **Challenge**  
> Create a new directory structure with some sample data files and ask Gordon to perform data analysis tasks on them. See if you can have Gordon generate a report combining the filesystem data with current time information.

---

## 🛠️ Troubleshooting

If you encounter issues:

- Ensure Docker is running properly  
- Check that your `gordon-mcp.yml` file is in the current directory  
- Verify the syntax of your YAML file  
- Try restarting Docker Desktop if containers won't start  

---

## 🏁 Conclusion

Congratulations! You've successfully set up your first MCP servers and learned how Gordon AI interacts with them. You've seen how Docker containers provide a secure and isolated environment for MCP servers, and how multiple servers can work together to enhance AI capabilities.

This foundational knowledge will be essential as you move on to more complex MCP configurations and use cases.

---

## 👉 Next Steps

Now that you've completed your first MCP lab, you can continue your learning journey with:

- [Lab 2: Building a Research Assistant with MCP](/docs/labs/research-assistant-lab) – Learn how to create a powerful research assistant using multiple MCP servers  
- [Lab 3: Database Operations with MCP Servers](/docs/labs/database-operations-lab) – Explore how to use MCP servers for database interactions  
```
