#!/usr/bin/env python3
"""
MCP Server Updater Script

This script fetches MCP server information from multiple sources:
1. Posts from the r/mcp subreddit
2. GitHub repositories with MCP-related topics

It then updates the _data/mcp_servers.yml file in the GitHub repository with new servers.

Requirements:
- praw (Python Reddit API Wrapper)
- pyyaml
- github3.py
- requests

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
import json
import time
import logging
import requests
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
MAX_REDDIT_POSTS = 100  # Maximum number of Reddit posts to fetch
POST_TIMEFRAME = 'week'  # 'day', 'week', 'month', 'year', 'all'
GITHUB_SEARCH_TERMS = ['mcp-server', 'model-context-protocol', 'anthropic-mcp', 'docker-mcp']
MAX_GITHUB_REPOS = 50  # Maximum number of repositories to fetch per search term

# Configure Reddit API client
def get_reddit_client():
    """Initialize and return the Reddit API client."""
    try:
        # Try to import praw - if it's not available, we'll just skip Reddit sources
        import praw
        
        return praw.Reddit(
            client_id=os.environ.get('REDDIT_CLIENT_ID'),
            client_secret=os.environ.get('REDDIT_CLIENT_SECRET'),
            user_agent=os.environ.get('REDDIT_USER_AGENT')
        )
    except ImportError:
        logger.warning("PRAW (Python Reddit API Wrapper) is not installed. Reddit sources will be skipped.")
        return None
    except Exception as e:
        logger.warning(f"Failed to initialize Reddit client: {e}. Reddit sources will be skipped.")
        return None

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

# Reddit-specific functions
def extract_mcp_server_info_from_reddit(post):
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
        'added_date': datetime.now().strftime('%Y-%m-%d'),
        'source': 'reddit'
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
        # Add 'reddit' and 'community' tags by default
        server_info['tags'].append('reddit')
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
        logger.warning(f"Missing required fields for Reddit post: {post.title}")
        return None
    
    return server_info

def get_mcp_servers_from_reddit(reddit_client):
    """Fetch MCP servers from Reddit r/mcp subreddit."""
    if not reddit_client:
        return []

    try:
        subreddit = reddit_client.subreddit(SUBREDDIT_NAME)
        posts = list(subreddit.top(time_filter=POST_TIMEFRAME, limit=MAX_REDDIT_POSTS))
        posts.extend(list(subreddit.new(limit=MAX_REDDIT_POSTS)))
        
        logger.info(f"Fetched {len(posts)} posts from r/{SUBREDDIT_NAME}")
        
        # Process posts
        reddit_servers = []
        for post in posts:
            server_info = extract_mcp_server_info_from_reddit(post)
            if server_info:
                reddit_servers.append(server_info)
                
        logger.info(f"Found {len(reddit_servers)} potential MCP servers from Reddit")
        return reddit_servers
    except Exception as e:
        logger.error(f"Error fetching from Reddit: {e}")
        return []

# GitHub-specific functions
def search_github_repos(search_term, page=1):
    """Search GitHub repositories with the given search term."""
    try:
        headers = {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': f'token {os.environ.get("GITHUB_TOKEN")}'
        }
        url = f'https://api.github.com/search/repositories?q={search_term}+in:name,description,readme&sort=updated&order=desc&page={page}&per_page=30'
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Failed to search GitHub repositories: {e}")
        return {"items": []}

def get_repository_topics(repo_owner, repo_name):
    """Get topics for a specific repository."""
    try:
        headers = {
            'Accept': 'application/vnd.github.mercy-preview+json',
            'Authorization': f'token {os.environ.get("GITHUB_TOKEN")}'
        }
        url = f'https://api.github.com/repos/{repo_owner}/{repo_name}/topics'
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json().get('names', [])
    except Exception as e:
        logger.warning(f"Failed to get topics for {repo_owner}/{repo_name}: {e}")
        return []

def get_docker_image_from_repo(repo_owner, repo_name):
    """Extract Docker image information from repository."""
    try:
        # Check common files where Docker image info might be present
        files_to_check = ['README.md', 'docker-compose.yml', 'Dockerfile']
        headers = {
            'Accept': 'application/vnd.github.v3.raw',
            'Authorization': f'token {os.environ.get("GITHUB_TOKEN")}'
        }
        
        for file_path in files_to_check:
            url = f'https://api.github.com/repos/{repo_owner}/{repo_name}/contents/{file_path}'
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                content = response.text
                
                # Look for Docker image references
                docker_matches = re.findall(r'(?:docker\s+pull\s+|docker\.io/|image:\s+)?([\w\-\_\.\/]+:[\w\-\_\.]+)', content)
                if docker_matches:
                    # Filter out non-Docker image strings
                    for match in docker_matches:
                        if not any(invalid in match for invalid in ['http:', 'https:', 'git:', 'file:', 'version:', 'tag:']):
                            return match
        
        # Default to a repository-based name if no image is found
        return f"{repo_owner}/{repo_name}:latest"
    except Exception as e:
        logger.warning(f"Failed to get Docker image for {repo_owner}/{repo_name}: {e}")
        return f"{repo_owner}/{repo_name}:latest"

def extract_mcp_server_info_from_github(repo_data):
    """
    Extract MCP server information from a GitHub repository.
    Returns a dictionary with server details.
    """
    # Default values
    server_info = {
        'name': repo_data['name'],
        'description': repo_data.get('description', 'A Model Context Protocol server') or 'A Model Context Protocol server',
        'github_url': repo_data['html_url'],
        'docker_image': None,
        'website': repo_data.get('homepage', ''),
        'tags': [],
        'added_date': datetime.now().strftime('%Y-%m-%d'),
        'source': 'github'
    }
    
    # Get repository topics as tags
    repo_owner, repo_name = repo_data['full_name'].split('/')
    topics = get_repository_topics(repo_owner, repo_name)
    
    # Add relevant topics as tags
    for topic in topics:
        if topic not in ['mcp', 'server', 'docker']:
            server_info['tags'].append(topic)
    
    # Add some default tags
    server_info['tags'].append('github')
    server_info['tags'].append('community')
    
    # Ensure description is not too long
    if server_info['description']:
        server_info['description'] = server_info['description'][:250]
    
    # Get Docker image information
    server_info['docker_image'] = get_docker_image_from_repo(repo_owner, repo_name)
    
    # Remove duplicates in tags
    server_info['tags'] = list(set(server_info['tags']))
    
    return server_info

def is_relevant_mcp_server(repo_data):
    """Check if the repository is likely an MCP server."""
    # Check name and description for MCP-related terms
    name_and_desc = (repo_data.get('name', '') + ' ' + repo_data.get('description', '')).lower()
    
    mcp_terms = ['mcp', 'model context protocol', 'claude', 'anthropic', 'docker mcp']
    server_terms = ['server', 'tool', 'function', 'agent', 'provider']
    
    has_mcp_term = any(term in name_and_desc for term in mcp_terms)
    has_server_term = any(term in name_and_desc for term in server_terms)
    
    # If it mentions both MCP and server concepts, it's likely relevant
    if has_mcp_term and has_server_term:
        return True
    
    # Check topics for MCP-related terms
    if 'full_name' in repo_data:
        repo_owner, repo_name = repo_data['full_name'].split('/')
        topics = get_repository_topics(repo_owner, repo_name)
        if 'mcp' in topics or 'model-context-protocol' in topics:
            return True
    
    return False

def get_mcp_servers_from_github():
    """Fetch MCP servers from GitHub repositories."""
    all_repos = []
    for term in GITHUB_SEARCH_TERMS:
        logger.info(f"Searching GitHub for: {term}")
        page = 1
        while page <= 3:  # Limit to 3 pages for each search term
            search_results = search_github_repos(term, page)
            repos = search_results.get('items', [])
            if not repos:
                break
                
            all_repos.extend(repos)
            logger.info(f"Found {len(repos)} repositories for '{term}' on page {page}")
            
            # Check if we need to paginate
            if len(repos) < 30:
                break
                
            page += 1
            time.sleep(1)  # Avoid rate limiting
    
    # Remove duplicates based on repository ID
    unique_repos = {}
    for repo in all_repos:
        if repo['id'] not in unique_repos:
            unique_repos[repo['id']] = repo
    
    all_repos = list(unique_repos.values())
    logger.info(f"Found {len(all_repos)} unique repositories")
    
    # Process repositories
    github_servers = []
    for repo_data in all_repos:
        # Only process repositories that are likely MCP servers
        if is_relevant_mcp_server(repo_data):
            server_info = extract_mcp_server_info_from_github(repo_data)
            if server_info:
                github_servers.append(server_info)
    
    logger.info(f"Found {len(github_servers)} potential MCP servers from GitHub")
    return github_servers

# Common functions
def is_new_server(server, existing_servers):
    """Check if the server is new and not already in the list."""
    for existing in existing_servers:
        # Check by GitHub URL (most reliable identifier)
        if existing.get('github_url') == server['github_url']:
            return False
        
        # Check by Docker image
        if existing.get('docker_image') == server['docker_image']:
            return False
        
        # Check by name similarity
        if existing.get('name', '').lower() == server['name'].lower():
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
    reddit_client = get_reddit_client()
    github_repo = get_github_client()
    
    # Get existing servers
    existing_servers, content_file = get_existing_servers(github_repo)
    logger.info(f"Found {len(existing_servers)} existing MCP servers")
    
    # Get potential servers from all sources
    all_new_servers = []
    
    # 1. Get servers from Reddit
    if reddit_client:
        reddit_servers = get_mcp_servers_from_reddit(reddit_client)
        for server in reddit_servers:
            if is_new_server(server, existing_servers):
                logger.info(f"Found new MCP server from Reddit: {server['name']}")
                all_new_servers.append(server)
    else:
        logger.info("Skipping Reddit source - client not available")
    
    # 2. Get servers from GitHub
    github_servers = get_mcp_servers_from_github()
    for server in github_servers:
        if is_new_server(server, existing_servers) and is_new_server(server, all_new_servers):
            logger.info(f"Found new MCP server from GitHub: {server['name']}")
            all_new_servers.append(server)
    
    # Update YAML file with all new servers
    if all_new_servers:
        logger.info(f"Found {len(all_new_servers)} total new MCP servers to add")
        update_yaml_file(github_repo, content_file, existing_servers, all_new_servers)
    else:
        logger.info("No new MCP servers found from any source")
    
    logger.info("MCP server update process completed")

if __name__ == "__main__":
    main()