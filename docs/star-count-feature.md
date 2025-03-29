# GitHub Star Count Feature

## Overview

The MCP Portal now includes GitHub star counts for all MCP servers and tools that are hosted on GitHub. This feature provides valuable information about the popularity and community adoption of various MCP implementations.

## How It Works

The `update_mcp_servers.py` script has been enhanced to:

1. Fetch the current star count for GitHub repositories when adding new MCP servers
2. Update existing MCP server entries with their current star counts
3. Handle GitHub API rate limiting gracefully with retries

## Implementation Details

### Adding Star Counts to New Servers

When a new MCP server is discovered (either from Reddit or GitHub searches), the script:

- Extracts the GitHub repository URL
- Fetches the current star count using the GitHub API
- Adds this information to the server's metadata

### Updating Existing Servers

For existing MCP servers that already have GitHub URLs but don't have star counts (or need updates):

- The script checks each entry in the YAML file
- If a GitHub URL exists but no star count is present, it queries the GitHub API
- It updates the YAML file with the latest star count

### Rate Limit Handling

To avoid GitHub API rate limiting issues:

- The script detects when it hits rate limits
- It waits for the appropriate time (based on the X-RateLimit-Reset header)
- It then retries the request

## Automation

A GitHub Actions workflow (`update-mcp-stars.yml`) has been added to automatically update star counts:

- It runs daily at 2 AM UTC
- It can also be triggered manually from the GitHub Actions tab
- It commits any changes to the repository

## Benefits

- **Community Insights**: Users can quickly see which MCP servers are most popular
- **Trending Analysis**: Over time, we can track which implementations are gaining traction
- **Quality Indicator**: Star counts often correlate with quality and reliability

## Example

Here's an example of how star counts appear in the YAML file:

```yaml
- name: Example MCP Server
  description: A great MCP server implementation
  github_url: https://github.com/username/example-mcp-server
  docker_image: username/example-mcp-server:latest
  website: https://example.com
  tags: [python, database, security]
  stars: 425  # The GitHub star count
  added_date: 2025-03-25
```

## Technical Notes

- The GitHub API is called with the appropriate authentication to allow for a higher rate limit
- The script implements exponential backoff when encountering rate limits
- Star counts are only fetched for repositories that have valid GitHub URLs
