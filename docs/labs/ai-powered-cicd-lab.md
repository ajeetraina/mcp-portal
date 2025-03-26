---
layout: lab
title: Lab 6: Building AI-Powered CI/CD Pipelines with MCP
description: Learn how to create intelligent CI/CD pipelines that leverage AI capabilities through Docker MCP servers to automate and enhance your development workflow.
difficulty: Advanced
time: 90 minutes
author: Collabnix Team
last_updated: March 18, 2025
prev_lab: /docs/labs/kubernetes-mcp-lab
next_lab: /docs/labs/enterprise-mcp-lab
---

<div class="lab-prerequisites">
  <h2><i class="fas fa-clipboard-list"></i> Prerequisites</h2>
  <ul>
    <li>GitHub account with repository creation permissions</li>
    <li>Basic understanding of CI/CD concepts</li>
    <li>Docker Desktop installed</li>
    <li>Git CLI installed</li>
    <li>Completion of previous MCP labs recommended</li>
  </ul>
</div>

<div class="learning-objectives">
  <h2><i class="fas fa-graduation-cap"></i> Learning Objectives</h2>
  <ol>
    <li>Set up a CI/CD pipeline that integrates with MCP servers</li>
    <li>Implement AI-powered code reviews using Gordon AI and MCP</li>
    <li>Create automated documentation generation with AI assistance</li>
    <li>Build intelligent test generation and optimization</li>
    <li>Deploy applications with AI-assisted configuration management</li>
  </ol>
</div>

<div class="lab-step">
  <div class="lab-step-header">
    <i class="fas fa-project-diagram"></i> Step 1: Setting Up Your Project
  </div>
  <div class="lab-step-content">
    <p>First, let's create a sample project that we'll use throughout this lab:</p>

```bash
# Create a new directory for your project
mkdir ai-cicd-lab
cd ai-cicd-lab

# Initialize a Git repository
git init

# Create a simple Node.js application
npm init -y
npm install express

# Create a basic Express server
cat > server.js << 'EOF'
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello from AI-powered CI/CD pipeline!');
});

app.get('/api/data', (req, res) => {
  // This is intentionally inefficient code that our AI will help improve
  let data = [];
  for (let i = 0; i < 100; i++) {
    data.push({ id: i, value: `Item ${i}` });
  }
  
  // Inefficient filtering
  const filteredData = data.filter(item => item.id % 2 === 0);
  
  res.json(filteredData);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
EOF

# Create a simple test file
mkdir -p test
cat > test/server.test.js << 'EOF'
const assert = require('assert');
const http = require('http');

describe('Server Tests', () => {
  it('should return 200 on root path', (done) => {
    http.get('http://localhost:3000/', (res) => {
      assert.strictEqual(res.statusCode, 200);
      done();
    });
  });
});
EOF

# Create a package.json with test script
cat > package.json << 'EOF'
{
  "name": "ai-cicd-lab",
  "version": "1.0.0",
  "description": "AI-powered CI/CD lab",
  "main": "server.js",
  "scripts": {
    "test": "mocha test/**/*.test.js",
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.17.1"
  },
  "devDependencies": {
    "mocha": "^9.1.3"
  }
}
EOF

# Install dev dependencies
npm install --save-dev mocha

# Initial commit
git add .
git commit -m "Initial commit"
```

    <p>Now, push this to a new GitHub repository:</p>

```bash
# Create a new repository on GitHub first, then:
git remote add origin https://github.com/yourusername/ai-cicd-lab.git
git push -u origin main
```
  </div>
</div>

<div class="lab-step">
  <div class="lab-step-header">
    <i class="fas fa-server"></i> Step 2: Setting Up MCP Servers for CI/CD
  </div>
  <div class="lab-step-content">
    <p>Let's create a directory to configure our MCP servers for the CI/CD pipeline:</p>

```bash
mkdir -p ci-cd/mcp
cd ci-cd/mcp
```

    <p>Create a <code>gordon-mcp.yml</code> file with the required MCP servers:</p>

```yaml
services:
  github:
    image: mcp/github
    environment:
      - GITHUB_TOKEN=${GITHUB_TOKEN}
  
  fs:
    image: mcp/filesystem
    command:
      - /rootfs
    volumes:
      - ../../:/rootfs
  
  fetch:
    image: mcp/fetch
```

    <p>We'll need to set up our GitHub token as an environment variable:</p>

```bash
# Replace with your GitHub token
export GITHUB_TOKEN=your_github_token_here
```

    <div class="lab-note">
      <h4><i class="fas fa-info-circle"></i> Note</h4>
      <p>In a real CI/CD environment, you'd store this token as a secure secret in your CI/CD system.</p>
    </div>
  </div>
</div>

<div class="lab-step">
  <div class="lab-step-header">
    <i class="fas fa-code-branch"></i> Step 3: Creating a CI/CD Workflow with GitHub Actions
  </div>
  <div class="lab-step-content">
    <p>Now let's create a GitHub Actions workflow that uses Gordon AI:</p>

```bash
# Create GitHub Actions workflow directory
mkdir -p .github/workflows

# Create the workflow file
cat > .github/workflows/ai-powered-cicd.yml << 'EOF'
name: AI-Powered CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  ai-code-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker
        uses: docker/setup-buildx-action@v2

      - name: AI Code Review
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          # Create gordon-mcp.yml for the CI environment
          cat > gordon-mcp.yml << 'INNEREOF'
          services:
            github:
              image: mcp/github
              environment:
                - GITHUB_TOKEN=${GITHUB_TOKEN}
            fs:
              image: mcp/filesystem
              command:
                - /rootfs
              volumes:
                - ./:/rootfs
          INNEREOF
          
          # Run AI code review
          docker ai "Review the code in this repository for potential issues, \
          security vulnerabilities, and performance problems. \
          Focus particularly on the server.js file and suggest improvements. \
          Format your response as a GitHub-compatible markdown comment."
          > code_review.md
          
          # Add the review as a comment on the PR if this is a pull request
          if [[ "${{ github.event_name }}" == "pull_request" ]]; then
            cat code_review.md | gh pr comment ${{ github.event.pull_request.number }} -F -
          fi

  ai-test-enhancement:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'

      - name: Set up Docker
        uses: docker/setup-buildx-action@v2

      - name: AI Test Enhancement
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          # Create gordon-mcp.yml for the CI environment
          cat > gordon-mcp.yml << 'INNEREOF'
          services:
            github:
              image: mcp/github
              environment:
                - GITHUB_TOKEN=${GITHUB_TOKEN}
            fs:
              image: mcp/filesystem
              command:
                - /rootfs
              volumes:
                - ./:/rootfs
          INNEREOF
          
          # Run AI test enhancement
          docker ai "Analyze the current tests in the test directory and suggest \
          additional test cases that would improve coverage. \
          Generate the code for these test cases and write them to the test directory. \
          Pay particular attention to the /api/data endpoint in server.js."

  build-and-deploy:
    runs-on: ubuntu-latest
    needs: [ai-code-review, ai-test-enhancement]
    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build Docker image
        run: docker build -t ai-cicd-app .

      - name: AI Deployment Recommendations
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          cat > gordon-mcp.yml << 'INNEREOF'
          services:
            github:
              image: mcp/github
              environment:
                - GITHUB_TOKEN=${GITHUB_TOKEN}
            fs:
              image: mcp/filesystem
              command:
                - /rootfs
              volumes:
                - ./:/rootfs
          INNEREOF
          
          # Get AI recommendations for deployment
          docker ai "Analyze this application and provide deployment recommendations. \
          Specifically, suggest appropriate resource settings (CPU/memory), \
          scaling recommendations, and any environment variables that should be set. \
          Write your recommendations to a file called deployment-recommendations.md."
          
          echo "Deployment recommendations generated. See deployment-recommendations.md for details."
EOF

# Create a simple Dockerfile for our application
cat > Dockerfile << 'EOF'
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
EOF

# Commit and push these changes
git add .
git commit -m "Add AI-powered CI/CD workflow"
git push origin main
```
  </div>
</div>

<div class="lab-step">
  <div class="lab-step-header">
    <i class="fas fa-code"></i> Step 4: Implementing AI-Powered Code Reviews
  </div>
  <div class="lab-step-content">
    <p>Let's create a branch with some code that could be improved to test our AI code review:</p>

```bash
# Create a new branch
git checkout -b feature/add-users-endpoint

# Update the server.js file with a new endpoint that has some issues
cat > server.js << 'EOF'
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// This global array is not ideal and will be flagged by our AI reviewer
let users = [];

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from AI-powered CI/CD pipeline!');
});

app.get('/api/data', (req, res) => {
  // Inefficient code that our AI will help improve
  let data = [];
  for (let i = 0; i < 100; i++) {
    data.push({ id: i, value: `Item ${i}` });
  }
  
  // Inefficient filtering
  const filteredData = data.filter(item => item.id % 2 === 0);
  
  res.json(filteredData);
});

// New users endpoints with issues
app.post('/api/users', (req, res) => {
  // No validation on input
  const user = req.body;
  
  // Potential security issue - no sanitization
  user.id = users.length + 1;
  
  // Storing password in plain text
  users.push(user);
  
  res.status(201).json(user);
});

app.get('/api/users', (req, res) => {
  // No pagination, will have performance issues with large datasets
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  // No error handling if id is not found
  // String comparison instead of number comparison
  const user = users.find(u => u.id == req.params.id);
  res.json(user);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
EOF

# Commit and push the changes
git add server.js
git commit -m "Add users endpoints with some flaws for AI to detect"
git push -u origin feature/add-users-endpoint
```

    <p>Now, create a pull request on GitHub from the <code>feature/add-users-endpoint</code> branch to <code>main</code>. The AI-powered CI/CD workflow will automatically run, and you should see the AI code review comments on your pull request.</p>

    <p>Let's also trigger the AI code review locally to see what it finds:</p>

```bash
cd ci-cd/mcp
docker ai "Review the code in server.js for potential issues, security vulnerabilities, and performance problems. Provide specific recommendations for improvement."
```
  </div>
</div>

<div class="lab-step">
  <div class="lab-step-header">
    <i class="fas fa-vial"></i> Step 5: AI-Generated Test Cases
  </div>
  <div class="lab-step-content">
    <p>Let's use Gordon AI to enhance our test suite:</p>

```bash
cd ci-cd/mcp
docker ai "Analyze our current server.js file and the existing tests in test/server.test.js. Generate comprehensive test cases for the new user endpoints we added, including tests for edge cases and error conditions. Write the new tests to a file called test/users.test.js."
```

    <p>View the generated tests and add them to the repository:</p>

```bash
cat ../../test/users.test.js
git add ../../test/users.test.js
git commit -m "Add AI-generated tests for users endpoints"
git push
```
  </div>
</div>

<div class="lab-step">
  <div class="lab-step-header">
    <i class="fas fa-book"></i> Step 6: Automated Documentation Generation
  </div>
  <div class="lab-step-content">
    <p>Let's use Gordon AI to generate comprehensive API documentation:</p>

```bash
cd ci-cd/mcp
docker ai "Analyze the server.js file and generate comprehensive API documentation in markdown format. Include details for each endpoint, example requests and responses, and any parameters that need to be provided. Write the documentation to a file called API.md in the root directory."
```

    <p>View and commit the generated documentation:</p>

```bash
cat ../../API.md
git add ../../API.md
git commit -m "Add AI-generated API documentation"
git push
```
  </div>
</div>

<div class="lab-step">
  <div class="lab-step-header">
    <i class="fas fa-code-branch"></i> Step 7: Implementing AI-Assisted Code Improvements
  </div>
  <div class="lab-step-content">
    <p>Now let's have Gordon AI help us improve the code based on its review:</p>

```bash
cd ci-cd/mcp
docker ai "Rewrite the server.js file to address the security, performance, and architectural issues you identified. Specifically:
1. Properly validate and sanitize user input
2. Implement secure password handling
3. Add pagination to the users endpoint
4. Fix the inefficient data generation and filtering
5. Implement proper error handling
6. Fix the global state issue

Write the improved code to a file called server.improved.js in the root directory."
```

    <p>Review the improvements and update our server:</p>

```bash
cat ../../server.improved.js
cp ../../server.improved.js ../../server.js

# Test that everything still works
cd ../..
npm test

# Commit the improvements
git add server.js
git commit -m "Implement AI-suggested code improvements"
git push
```
  </div>
</div>

<div class="lab-step">
  <div class="lab-step-header">
    <i class="fas fa-rocket"></i> Step 8: AI-Assisted Deployment Configuration
  </div>
  <div class="lab-step-content">
    <p>Let's have Gordon AI help us create optimal deployment configurations:</p>

```bash
cd ci-cd/mcp
docker ai "Analyze our application and create optimal deployment configurations for:
1. Docker Compose for local development
2. Kubernetes deployment manifest for production
3. Environment variables that should be set
4. Resource requirements (CPU/memory)
5. Scaling recommendations

Create these files in a new 'deployment' directory."
```

    <p>Review and commit the deployment configurations:</p>

```bash
mkdir -p ../../deployment
ls -la ../../deployment
git add ../../deployment
git commit -m "Add AI-generated deployment configurations"
git push
```
  </div>
</div>

<div class="lab-step">
  <div class="lab-step-header">
    <i class="fas fa-chart-line"></i> Step 9: AI Performance Analysis and Optimization
  </div>
  <div class="lab-step-content">
    <p>Let's use Gordon AI to analyze and optimize the performance of our application:</p>

```bash
cd ci-cd/mcp
docker ai "Analyze the current server.js file and identify potential performance bottlenecks. Suggest and implement optimizations for the endpoints, especially focusing on the /api/data and /api/users endpoints. Consider:
1. Caching strategies
2. Database query optimization (assuming we would use a database)
3. Response time improvements
4. Memory usage optimization

Create an optimized version in a file called server.optimized.js and a performance analysis in PERFORMANCE.md."
```

    <p>Review the performance analysis and optimizations:</p>

```bash
cat ../../PERFORMANCE.md
cat ../../server.optimized.js

# Commit the performance analysis and optimizations
git add ../../PERFORMANCE.md ../../server.optimized.js
git commit -m "Add AI performance analysis and optimizations"
git push
```
  </div>
</div>

<div class="lab-tip">
  <h4><i class="fas fa-lightbulb"></i> CI/CD Integration Tips</h4>
  <p>Here are some tips for integrating AI capabilities in your CI/CD pipelines:</p>
  <ul>
    <li><strong>Environment Variables</strong>: Store your API keys and tokens securely as CI/CD secrets</li>
    <li><strong>Docker Cache</strong>: Use Docker layer caching to speed up MCP server startup in CI/CD environments</li>
    <li><strong>Automated Fixes</strong>: Consider having your pipeline automatically create pull requests with AI-suggested fixes</li>
    <li><strong>Selective Analysis</strong>: Only run AI analysis on changed files to save time in the CI/CD pipeline</li>
    <li><strong>Workflow Integration</strong>: Integrate AI reviews at the appropriate stages of your workflow (pre-commit, PR checks, etc.)</li>
  </ul>
</div>

<div class="lab-conclusion">
  <h2><i class="fas fa-flag-checkered"></i> Conclusion</h2>
  <p>Congratulations! You've successfully built an AI-powered CI/CD pipeline using Docker MCP servers. You've learned how to:</p>
  <ul>
    <li>Set up a CI/CD workflow that incorporates AI capabilities</li>
    <li>Implement automated code reviews with detailed suggestions</li>
    <li>Generate and enhance test cases automatically</li>
    <li>Create comprehensive documentation with AI assistance</li>
    <li>Optimize application performance using AI analysis</li>
    <li>Generate deployment configurations based on application needs</li>
  </ul>
  <p>These techniques can be applied to any development project to improve code quality, reduce bugs, and increase developer productivity through AI assistance.</p>
</div>

<div class="next-steps">
  <h2><i class="fas fa-arrow-circle-right"></i> Next Steps</h2>
  <p>Now that you've mastered AI-powered CI/CD with Docker MCP, you can:</p>
  <ul>
    <li><a href="/docs/labs/enterprise-mcp-lab">Lab 7: Enterprise MCP Deployment Strategies</a> - Learn how to deploy and manage MCP servers in enterprise environments</li>
    <li>Explore implementing AI-assisted incident management and monitoring</li>
    <li>Look into adding AI capabilities to your existing DevOps workflows</li>
    <li>Consider building custom MCP servers specific to your development processes</li>
  </ul>
</div>
