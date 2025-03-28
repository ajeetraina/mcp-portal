# Contributing to the MCP Community Portal

Thank you for your interest in contributing to the Docker MCP Community Portal! This document provides guidelines and instructions for adding your MCP server or tool to our collection.

## How to Add Your MCP Server

### Step 1: Fork the Repository

1. Fork the [MCP Community Portal repository](https://github.com/collabnix/mcp-community-portal)
2. Clone your fork to your local machine

### Step 2: Add Your MCP Server

Add your MCP server to the `_data/mcp_servers.yml` file by adding a new entry at the end of the file:

```yaml
- name: "Your MCP Server Name"
  description: "A brief description of your MCP server (keep it under 250 characters)"
  github_url: "https://github.com/your-username/your-repo"
  docker_image: "your-username/your-image:tag"
  website: "https://your-website.com" # Optional, leave as empty string if none
  tags: ["relevant", "tags", "here"]
  added_date: "YYYY-MM-DD" # Use today's date
```

### Guidelines for Your Entry

- **Name**: Keep it concise and descriptive
- **Description**: Highlight key features, use cases, or unique advantages
- **GitHub URL**: Direct link to the GitHub repository
- **Docker Image**: Full name of the Docker image (with tag)
- **Tags**: Choose relevant tags from the list below or add new ones if necessary
- **Added Date**: Use the current date in YYYY-MM-DD format

### Recommended Tags

Choose from these common tags or add new ones that accurately describe your server:

- `official` - For Docker's official implementations
- `reference` - Reference implementations
- `security` - Focus on security features
- `performance` - Optimized for performance
- `enterprise` - Suitable for enterprise environments
- `kubernetes` - Kubernetes integration
- `monitoring` - Includes monitoring features
- `lightweight` - Minimal resource usage
- `visualization` - Visual representation of MCP data
- `ai` - AI-related features
- `experimental` - Experimental or cutting-edge features

### Step 3: Submit a Pull Request

1. Commit your changes with a clear commit message
2. Push the changes to your fork
3. Create a Pull Request against the main repository
4. In your PR description, provide any additional context about your submission

## PR Preview Feature

When you submit a pull request, our automated system will build a preview of the site with your changes. This allows you and reviewers to see exactly how your contribution will look before it gets merged.

### How to Access Your PR Preview

1. After you submit your pull request, the GitHub Actions workflow will automatically build a preview version of the site with your changes
2. Once the build is complete (usually within 2-3 minutes), a comment will be posted on your PR with instructions on how to view the preview
3. To view the preview:
   - Click on the "Details" link next to the "PR Preview Deployment" check in the PR checks section
   - On the Actions run page, scroll to the bottom and click on the artifact with your PR number
   - Download and extract the zip file
   - Open the `index.html` file in your browser
4. Every time you update your PR with new commits, the preview will be automatically updated

This preview feature makes it easier to ensure that your contribution looks correct before it's merged into the main site.

## Pull Request Review Process

- Your pull request will be reviewed by maintainers
- We'll check that your submission follows the format and guidelines
- We may suggest changes or improvements
- The PR preview will help us verify that your changes display correctly
- Once approved, your MCP server will appear on the site

## Additional Contributions

We welcome other types of contributions:

- Documentation improvements
- Feature additions to the portal itself
- Bug fixes
- UI enhancements

For these types of contributions, please open an issue first to discuss your ideas.

## Questions?

If you have any questions or need help with your submission, please open an issue in the repository.

Thank you for contributing!