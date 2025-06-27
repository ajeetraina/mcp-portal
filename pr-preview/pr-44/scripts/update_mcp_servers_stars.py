#!/usr/bin/env python3
"""
MCP Server Stars Updater Script

This script updates the GitHub star counts for MCP servers listed in the _data/mcp_servers.yml file.
It doesn't add new servers - it only updates the star counts for existing servers.

Requirements:
- pyyaml
- requests

Usage:
python update_mcp_servers_stars.py

Environment variables:
- GITHUB_TOKEN: GitHub personal access token
"""

import os
import re
import sys
import yaml
import time
import logging
import requests
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger('mcp-stars-updater')

# Constants
YAML_FILE_PATH = '_data/mcp_servers.yml'
GITHUB_API_RATE_LIMIT_WAIT = 60  # Seconds to wait if we hit the GitHub API rate limit

def get_github_stars(repo_path):
    """Get the star count for a GitHub repository."""
    try:
        # Extract owner and repo from the path
        match = re.search(r'github\.com/([^/]+)/([^/]+)', repo_path)
        if not match:
            return 0
        
        repo_owner, repo_name = match.groups()
        
        headers = {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': f'token {os.environ.get("GITHUB_TOKEN")}'
        }
        url = f'https://api.github.com/repos/{repo_owner}/{repo_name}'
        response = requests.get(url, headers=headers)
        
        # Check for rate limiting
        if response.status_code == 403 and 'rate limit' in response.text.lower():
            reset_time = int(response.headers.get('X-RateLimit-Reset', 0))
            current_time = time.time()
            sleep_time = max(reset_time - current_time, GITHUB_API_RATE_LIMIT_WAIT)
            logger.warning(f"GitHub API rate limit reached. Waiting for {sleep_time} seconds...")
            time.sleep(sleep_time)
            # Retry the request
            return get_github_stars(repo_path)
            
        if response.status_code != 200:
            logger.warning(f"Failed to get star count for {repo_path}: {response.status_code} {response.text}")
            return None
            
        repo_data = response.json()
        return repo_data.get('stargazers_count', 0)
    except Exception as e:
        logger.warning(f"Failed to get star count for {repo_path}: {e}")
        return None

def update_yaml_file():
    """Update the YAML file with GitHub star counts."""
    try:
        # Read the existing YAML file
        with open(YAML_FILE_PATH, 'r') as f:
            content = f.read()
            yaml_data = yaml.safe_load(content)
        
        logger.info(f"Successfully loaded YAML file: {YAML_FILE_PATH}")
        
        # Keep track of servers updated
        servers_updated = 0
        
        # Check if there are server categories (working_servers, untested_servers, etc.)
        if isinstance(yaml_data, dict):
            for category, servers in yaml_data.items():
                if isinstance(servers, list):
                    for server in servers:
                        if 'docs_url' in server and 'github' in server['docs_url']:
                            stars = get_github_stars(server['docs_url'])
                            if stars is not None:
                                # Add a stars field if it doesn't exist
                                if 'stars' not in server:
                                    server['stars'] = stars
                                    servers_updated += 1
                                    logger.info(f"Added star count for {server['name']}: {stars} stars")
                                # Only update if the star count has changed
                                elif server['stars'] != stars:
                                    server['stars'] = stars
                                    servers_updated += 1
                                    logger.info(f"Updated star count for {server['name']}: {stars} stars")
                                    
                                # Add a small delay to avoid rate limiting
                                time.sleep(0.5)
        
        # Write the updated YAML back to the file
        with open(YAML_FILE_PATH, 'w') as f:
            yaml.dump(yaml_data, f, default_flow_style=False, sort_keys=False)
        
        if servers_updated > 0:
            logger.info(f"Updated star counts for {servers_updated} MCP servers")
        else:
            logger.info("No star counts needed to be updated")
        
        return servers_updated
    except Exception as e:
        logger.error(f"Failed to update YAML file: {e}")
        return 0

def main():
    """Main function to update MCP server star counts."""
    logger.info("Starting MCP server star count update process")
    
    # Update the star counts in the YAML file
    servers_updated = update_yaml_file()
    
    if servers_updated > 0:
        logger.info(f"Successfully updated star counts for {servers_updated} MCP servers")
    else:
        logger.info("No star count updates were needed")
    
    logger.info("MCP server star count update process completed")

if __name__ == "__main__":
    main()
