#!/usr/bin/env python3
"""
MCP Server Updater Script

This script fetches posts from the r/mcp subreddit, parses them to extract MCP server information,
and updates the _data/mcp_servers.yml file in the GitHub repository with new servers.

Requirements:
- praw (Python Reddit API Wrapper)
- pyyaml
- github3.py

Usage:
python update_mcp_servers.py

Environment variables:
- REDDIT_CLIENT_ID: Reddit API client ID
- REDDIT_CLIENT_SECRET: Reddit API client secret
- REDDIT_USER_AGENT: Reddit API user agent (e.g., "script:mcp-updater:v1.0 (by u/username)")
- GITHUB_TOKEN: GitHub personal access token
- GITHUB_REPO_OWNER: GitHub repository owner (username)
- GITHUB_REPO_NAME: GitHub repository name
"""

import os
import re
import sys
import yaml
import praw
import time
import logging
from datetime import datetime
from github3 import login

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger('mcp-updater')

# Constants
YAML_FILE_PATH = '_data/mcp_servers.yml'
REPO_BRANCH = 'main'
SUBREDDIT_NAME = 'mcp'
MAX_POSTS = 100  # Maximum number of posts to fetch
POST_TIMEFRAME = 'week'  # 'day', 'week', 'month', 'year', 'all'

# Configure Reddit API client
def get_reddit_client():
    """Initialize and return the Reddit API client."""
    try:
        return praw.Reddit(
            client_id=os.environ.get('REDDIT_CLIENT_ID'),
            client_secret=os.environ.get('REDDIT_CLIENT_SECRET'),
            user_agent=os.environ.get('REDDIT_USER_AGENT')
        )
    except Exception as e:
        logger.error(f"Failed to initialize Reddit client: {e}")
        sys.exit(1)

# Configure GitHub API client
def get_github_client():
    """Initialize and return the GitHub API client."""
    try:
        gh = login(token=os.environ.get('GITHUB_TOKEN'))
        return gh.repository(
            os.environ.get('GITHUB_REPO_OWNER'),
            os.environ.get('GITHUB_REPO_NAME')
        )
    except Exception as e:
        logger.error(f"Failed to initialize GitHub client: {e}")
        sys.exit(1)

def get_existing_servers(repo):
    """Fetch the existing MCP servers from the YAML file in the repository."""
    try:
        content = repo.file_contents(
            YAML_FILE_PATH,
            ref=REPO_BRANCH
        )
        yaml_content = content.decoded.decode('utf-8')
        return yaml.safe_load(yaml_content) or [], content
    except Exception as e:
        logger.error(f"Failed to fetch existing servers: {e}")
        return [], None

def extract_mcp_server_info(post):
    """
    Extract MCP server information from a Reddit post.
    Returns a dictionary with server details or None if parsing fails.
    """
    # Skip posts that don't look like MCP server announcements
    title_patterns = [
        r'new\s+mcp\s+server',
        r'mcp\s+implementation',
        r'mcp\s+server\s+release',
        r'released\s+mcp',
        r'docker\s+mcp'
    ]
    
    if not any(re.search(pattern, post.title, re.IGNORECASE) for pattern in title_patterns):
        return None
    
    # Default values
    server_info = {
        'name': None,
        'description': None,
        'github_url': None,
        'docker_image': None,
        'website': '',
        'tags': [],
        'added_date': datetime.now().strftime('%Y-%m-%d')
    }
    
    # Extract name from title
    name_match = re.search(r'(?:released|announcing|new):\s*([^:]+)', post.title, re.IGNORECASE)
    if name_match:
        server_info['name'] = name_match.group(1).strip()
    else:
        # Use the first part of the title as the name
        server_info['name'] = post.title.split(' - ')[0].strip()
    
    # Parse the post content
    content = post.selftext
    
    # Extract GitHub URL
    github_matches = re.findall(r'github\.com/[\w\-]+/[\w\-]+', content)
    if github_matches:
        server_info['github_url'] = f"https://{github_matches[0]}"
    
    # Extract Docker image
    docker_matches = re.findall(r'(?:docker\s+pull\s+|docker\.io/)?([\w\-\_\.\/]+:[\w\-\_\.]+)', content)
    if docker_matches:
        server_info['docker_image'] = docker_matches[0]
    
    # Extract website
    website_matches = re.findall(r'(?:website|homepage|site):\s*(https?://[\w\-\.]+\.\w+(?:/[\w\-\._~:/\?#\[\]@!\$&\'\(\)\*\+,;=]+)?)', content, re.IGNORECASE)
    if website_matches:
        server_info['website'] = website_matches[0]
    
    # Extract description - use post title or first paragraph
    if post.selftext:
        # Use the first paragraph that's not too short
        paragraphs = [p.strip() for p in post.selftext.split('\n\n') if len(p.strip()) > 30]
        if paragraphs:
            server_info['description'] = paragraphs[0][:250]  # Limit to 250 chars
        else:
            server_info['description'] = post.title
    else:
        server_info['description'] = post.title
    
    # Extract tags
    tag_patterns = [
        r'(?:tags|keywords):\s*([\w\s,\-\_]+)',
        r'#([\w\-\_]+)'
    ]
    for pattern in tag_patterns:
        tag_matches = re.findall(pattern, content, re.IGNORECASE)
        if tag_matches:
            for match in tag_matches:
                tags = [tag.strip().lower() for tag in re.split(r'[,\s]+', match) if tag.strip()]
                server_info['tags'].extend(tags)
    
    # If no tags were found, add some default ones
    if not server_info['tags']:
        # Add 'community' tag by default
        server_info['tags'].append('community')
        
        # Add some tags based on name and description
        combined_text = (server_info['name'] + ' ' + server_info['description']).lower()
        
        if any(term in combined_text for term in ['fast', 'speed', 'quick', 'performance']):
            server_info['tags'].append('performance')
            
        if any(term in combined_text for term in ['secure', 'security', 'authentication']):
            server_info['tags'].append('security')
            
        if any(term in combined_text for term in ['kubernetes', 'k8s']):
            server_info['tags'].append('kubernetes')
            
        if any(term in combined_text for term in ['light', 'lightweight', 'minimal']):
            server_info['tags'].append('lightweight')
    
    # Remove duplicates
    server_info['tags'] = list(set(server_info['tags']))
    
    # Ensure we have required fields
    if not server_info['github_url'] or not server_info['docker_image']:
        logger.warning(f"Missing required fields for post: {post.title}")
        return None
    
    return server_info

def is_new_server(server, existing_servers):
    """Check if the server is new and not already in the list."""
    for existing in existing_servers:
        # Check by GitHub URL (most reliable identifier)
        if existing['github_url'] == server['github_url']:
            return False
        
        # Check by Docker image
        if existing['docker_image'] == server['docker_image']:
            return False
        
        # Check by name similarity
        if existing['name'].lower() == server['name'].lower():
            return False
    
    return True

def update_yaml_file(repo, content_file, existing_servers, new_servers):
    """Update the YAML file with new servers and push to GitHub."""
    if not new_servers:
        logger.info("No new servers to add.")
        return
    
    # Add new servers to the list
    updated_servers = existing_servers + new_servers
    
    # Convert to YAML
    yaml_content = "# Model Context Protocol Servers\n"
    yaml_content += "# Format:\n"
    yaml_content += "# - name: Name of the MCP server\n"
    yaml_content += "#   description: A brief description of the server's features or purpose\n"
    yaml_content += "#   github_url: Link to the GitHub repository\n"
    yaml_content += "#   docker_image: Docker image name and tag\n"
    yaml_content += "#   website: Optional website URL\n"
    yaml_content += "#   tags: List of relevant tags\n"
    yaml_content += "#   added_date: When the entry was added (YYYY-MM-DD)\n\n"
    
    # Add servers to YAML content
    yaml_content += yaml.dump(updated_servers, default_flow_style=False, sort_keys=False)
    
    try:
        # Commit the changes
        commit_message = f"Add {len(new_servers)} new MCP server{'s' if len(new_servers) > 1 else ''}"
        repo.update_file(
            path=YAML_FILE_PATH,
            message=commit_message,
            content=yaml_content,
            sha=content_file.sha,
            branch=REPO_BRANCH
        )
        logger.info(f"Successfully updated YAML file: {commit_message}")
    except Exception as e:
        logger.error(f"Failed to update YAML file: {e}")

def main():
    """Main function to update MCP servers."""
    logger.info("Starting MCP server update process")
    
    # Initialize API clients
    reddit = get_reddit_client()
    repo = get_github_client()
    
    # Get existing servers
    existing_servers, content_file = get_existing_servers(repo)
    logger.info(f"Found {len(existing_servers)} existing MCP servers")
    
    # Fetch Reddit posts
    subreddit = reddit.subreddit(SUBREDDIT_NAME)
    posts = list(subreddit.top(time_filter=POST_TIMEFRAME, limit=MAX_POSTS))
    posts.extend(list(subreddit.new(limit=MAX_POSTS)))
    
    logger.info(f"Fetched {len(posts)} posts from r/{SUBREDDIT_NAME}")
    
    # Process posts
    new_servers = []
    for post in posts:
        server_info = extract_mcp_server_info(post)
        if server_info and is_new_server(server_info, existing_servers):
            logger.info(f"Found new MCP server: {server_info['name']}")
            new_servers.append(server_info)
    
    # Update YAML file
    if new_servers:
        logger.info(f"Found {len(new_servers)} new MCP servers to add")
        update_yaml_file(repo, content_file, existing_servers, new_servers)
    else:
        logger.info("No new MCP servers found")
    
    logger.info("MCP server update process completed")

if __name__ == "__main__":
    main()