import React from 'react';
import { Link } from 'react-router-dom';

const Installation = () => {
  return (
    <div className="tutorial-page">
      <h1>Installing Docker MCP Toolkit</h1>
      
      <div className="tutorial-intro">
        <p>
          In this section, you'll learn how to set up the Docker MCP Toolkit on your system.
          We'll walk through each step of the installation process to ensure you have a working environment.
        </p>
      </div>
      
      <div className="prerequisites">
        <h2>Prerequisites</h2>
        <ul>
          <li>
            <strong>Docker:</strong> Make sure you have Docker installed on your system.
            <ul>
              <li><a href="https://docs.docker.com/get-docker/" target="_blank" rel="noopener noreferrer">Get Docker</a></li>
            </ul>
          </li>
          <li>
            <strong>Docker Compose:</strong> The MCP Toolkit uses Docker Compose for managing multi-container applications.
            <ul>
              <li>Docker Desktop includes Docker Compose by default</li>
              <li>For Linux users: <a href="https://docs.docker.com/compose/install/" target="_blank" rel="noopener noreferrer">Install Docker Compose</a></li>
            </ul>
          </li>
          <li>
            <strong>API Keys:</strong> You'll need appropriate API keys for the services you want to integrate
          </li>
        </ul>
      </div>
      
      <div className="installation-steps">
        <h2>Step 1: Create Project Directory</h2>
        <p>Start by creating a new directory for your MCP project:</p>
        <div className="code-block">
          <pre><code>{`mkdir docker-mcp-project
cd docker-mcp-project`}</code></pre>
        </div>
        
        <h2>Step 2: Create Docker Compose File</h2>
        <p>Create a new file called <code>docker-compose.yml</code> with the following content:</p>
        <div className="code-block">
          <pre><code>{`version: '3'
services:
  mcp-proxy:
    image: anthropic/mcp-proxy:latest
    ports:
      - "8080:8080"
    environment:
      - MCP_API_KEY=\${MCP_API_KEY}
      - CLAUDE_API_KEY=\${CLAUDE_API_KEY}
    volumes:
      - ./config:/app/config
    restart: unless-stopped`}</code></pre>
        </div>
        
        <h2>Step 3: Create Configuration Directory</h2>
        <p>Create a configuration directory to store your tool definitions:</p>
        <div className="code-block">
          <pre><code>{`mkdir -p config`}</code></pre>
        </div>
        
        <h2>Step 4: Create Basic Tool Configuration</h2>
        <p>Create a file called <code>config/tools.json</code> with a basic configuration:</p>
        <div className="code-block">
          <pre><code>{`{
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
}`}</code></pre>
        </div>
        
        <h2>Step 5: Set Up Environment Variables</h2>
        <p>Create a <code>.env</code> file to store your API keys (don't commit this file to version control):</p>
        <div className="code-block">
          <pre><code>{`MCP_API_KEY=your_mcp_api_key
CLAUDE_API_KEY=your_claude_api_key`}</code></pre>
        </div>
        <p>Replace <code>your_mcp_api_key</code> and <code>your_claude_api_key</code> with your actual API keys.</p>
        
        <h2>Step 6: Start the MCP Server</h2>
        <p>Launch your MCP server using Docker Compose:</p>
        <div className="code-block">
          <pre><code>{`docker-compose up -d`}</code></pre>
        </div>
        
        <h2>Step 7: Verify Installation</h2>
        <p>Check if your MCP server is running correctly:</p>
        <div className="code-block">
          <pre><code>{`curl http://localhost:8080/healthz`}</code></pre>
        </div>
        <p>You should see a response indicating that the server is healthy.</p>
      </div>
      
      <div className="troubleshooting">
        <h2>Common Installation Issues</h2>
        <div className="issue">
          <h3>Port Conflicts</h3>
          <p>
            If port 8080 is already in use, you can change the port mapping in your 
            <code>docker-compose.yml</code> file to use a different port, such as 8081:
          </p>
          <div className="code-block">
            <pre><code>{`ports:
  - "8081:8080"`}</code></pre>
          </div>
        </div>
        
        <div className="issue">
          <h3>Docker Permission Issues</h3>
          <p>
            If you encounter permission issues on Linux, you might need to add your user 
            to the docker group:
          </p>
          <div className="code-block">
            <pre><code>{`sudo usermod -aG docker $USER
newgrp docker`}</code></pre>
          </div>
        </div>
        
        <div className="issue">
          <h3>API Key Issues</h3>
          <p>
            Make sure your API keys are correctly set in the .env file and that they haven't expired.
          </p>
        </div>
      </div>
      
      <div className="next-steps">
        <h2>Next Steps</h2>
        <p>
          Now that you have successfully installed the Docker MCP Toolkit, let's move on to 
          learning the <Link to="/tutorials/docker-mcp/basic-usage">basic usage</Link> of the toolkit.
        </p>
      </div>
    </div>
  );
};

export default Installation;