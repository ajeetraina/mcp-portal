# Fetching MCP Servers and Tools from Awesome MCP

This document describes the automated process for fetching MCP server and tool information from the [punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) repository and updating the MCP Portal data files.

## Overview

The MCP Portal maintains two primary data files:

1. `_data/mcp_servers.yml` - Contains information about MCP servers
2. `_data/mcp_tools.yml` - Contains information about MCP tools, frameworks, clients, and utilities

To keep these files up-to-date with the latest community contributions, we've implemented an automated process that fetches information from the `punkpeye/awesome-mcp-servers` repository, which is a popular, community-maintained list of MCP servers and tools.

## How It Works

### The Fetch Script

The `scripts/fetch_from_awesome_mcp.py` script:

1. Fetches the README.md file from the `punkpeye/awesome-mcp-servers` repository
2. Parses the markdown to extract server and tool entries
3. Compares these entries with our existing data
4. Adds any new entries to our data files
5. Commits the changes to the repository

### Automation with GitHub Actions

A GitHub Actions workflow (`.github/workflows/fetch-awesome-mcp.yml`) runs the fetch script automatically:

- Weekly on Sunday at midnight UTC
- Manually when triggered from the GitHub Actions tab

## Implementation Details

### Server Entry Extraction

The script extracts server entries from the README.md file by identifying patterns like:

```
- [@username/repo-name](https://github.com/username/repo-name) 🐍 🏠 - Description
```

It captures:
- The name
- The GitHub URL
- The description
- Tags derived from emoji indicators (e.g., 🐍 indicates Python)

### Tool Entry Extraction

Similarly, it extracts tool entries from the Frameworks, Clients, and Utilities sections of the README.md file.

### Duplicate Detection

To avoid adding duplicate entries, the script checks for:
- Matching GitHub URLs
- Matching names (case-insensitive)

## Requirements

The script requires the following Python packages:

- `requests` - For fetching data from GitHub
- `pyyaml` - For parsing and updating YAML files
- `github3.py` - For GitHub API integration
- `beautifulsoup4` - For parsing markdown/HTML

## Running Manually

To run the fetch script manually:

1. Set up the required environment variables:
   ```bash
   export GITHUB_TOKEN=your_github_token
   export GITHUB_REPO_OWNER=ajeetraina
   export GITHUB_REPO_NAME=mcp-portal
   ```

2. Install dependencies:
   ```bash
   pip install requests pyyaml github3.py beautifulsoup4
   ```

3. Run the script:
   ```bash
   python scripts/fetch_from_awesome_mcp.py
   ```

## Future Improvements

- Add better categorization of servers (working, untested, unsupported)
- Implement more sophisticated duplicate detection
- Add support for fetching from multiple sources
- Enhance metadata extraction for better tagging
- Add validation checks for entries
