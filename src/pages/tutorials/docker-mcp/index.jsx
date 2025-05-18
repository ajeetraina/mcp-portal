import React from 'react';

const DockerMcpIntro = () => {
  return (
    <div className="tutorial-page">
      <h1>Getting Started with Docker MCP Toolkit</h1>
      
      <div className="tutorial-intro">
        <p>
          Welcome to the Docker MCP Toolkit tutorial! This comprehensive guide will help you 
          set up and use the Model Context Protocol (MCP) with Docker, making it easy to deploy 
          and manage AI-powered tools and services.
        </p>
      </div>
      
      <div className="tutorial-overview">
        <h2>What You'll Learn</h2>
        <ul>
          <li>Understanding MCP and its benefits</li>
          <li>Setting up your Docker environment for MCP</li>
          <li>Creating your first MCP server</li>
          <li>Configuring tools and services</li>
          <li>Connecting your AI models with external services</li>
          <li>Troubleshooting common issues</li>
        </ul>
      </div>
      
      <div className="prerequisites">
        <h2>Prerequisites</h2>
        <ul>
          <li>Basic understanding of Docker concepts</li>
          <li>Docker Desktop installed on your machine</li>
          <li>Familiarity with command line interfaces</li>
          <li>A text editor of your choice</li>
        </ul>
      </div>
      
      <div className="what-is-mcp">
        <h2>What is Model Context Protocol (MCP)?</h2>
        <p>
          Model Context Protocol (MCP) is a communication protocol that allows AI models 
          to access external tools and services. Originally introduced by Anthropic, MCP enables 
          Claude and other AI models to interact with a wide range of capabilities, including:
        </p>
        <ul>
          <li>Web browsing and search</li>
          <li>Database access</li>
          <li>File operations</li>
          <li>Code execution</li>
          <li>API interactions</li>
          <li>And many more external tools</li>
        </ul>
        
        <p>
          The Docker MCP Toolkit simplifies deploying and managing MCP servers, making it 
          easier for developers to build powerful AI applications with external tool access.
        </p>
      </div>
      
      <div className="tutorial-navigation">
        <h2>How to Use This Tutorial</h2>
        <p>
          This tutorial is designed to be followed sequentially, starting with installation 
          and progressing through basic usage to more advanced topics. Use the sidebar 
          navigation to move between sections, and feel free to skip ahead if you're already 
          familiar with certain concepts.
        </p>
        <p>
          Each section includes both explanations and practical code examples that you 
          can follow along with. We recommend typing out the commands yourself rather than 
          copy-pasting to better internalize the concepts.
        </p>
        <div className="next-steps">
          <p>Ready to begin? Let's start with <a href="/tutorials/docker-mcp/installation">installing the Docker MCP Toolkit</a>.</p>
        </div>
      </div>
    </div>
  );
};

export default DockerMcpIntro;