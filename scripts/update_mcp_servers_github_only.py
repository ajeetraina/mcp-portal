#!/usr/bin/env python3
"""
MCP Server Updater Script (GitHub-only version)

This script fetches MCP server information from GitHub repositories with MCP-related topics.
It then updates the _data/mcp_servers.yml file in the GitHub repository with new servers.
Additionally, it adds GitHub star counts for each server with a GitHub URL.

Requirements:
- pyyaml
- github3.py
- requests

Usage:
python update_mcp_servers_github_only.py

Environment variables:
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
GITHUB_SEARCH_TERMS = ['mcp-server', 'model-context-protocol', 'anthropic-mcp', 'docker-mcp']
MAX_GITHUB_REPOS = 50  # Maximum number of repositories to fetch per search term
GITHUB_API_RATE_LIMIT_WAIT = 60  # Seconds to wait if we hit the GitHub API rate limit

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
        
        # Check for rate limiting
        if response.status_code == 403 and 'rate limit' in response.text.lower():
            reset_time = int(response.headers.get('X-RateLimit-Reset', 0))
            current_time = time.time()
            sleep_time = max(reset_time - current_time, GITHUB_API_RATE_LIMIT_WAIT)
            logger.warning(f"GitHub API rate limit reached. Waiting for {sleep_time} seconds...")
            time.sleep(sleep_time)
            # Retry the request
            return search_github_repos(search_term, page)
        
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
        
        # Check for rate limiting
        if response.status_code == 403 and 'rate limit' in response.text.lower():
            reset_time = int(response.headers.get('X-RateLimit-Reset', 0))
            current_time = time.time()
            sleep_time = max(reset_time - current_time, GITHUB_API_RATE_LIMIT_WAIT)
            logger.warning(f"GitHub API rate limit reached. Waiting for {sleep_time} seconds...")
            time.sleep(sleep_time)
            # Retry the request
            return get_repository_topics(repo_owner, repo_name)
        
        response.raise_for_status()
        return response.json().get('names', [])
    except Exception as e:
        logger.warning(f"Failed to get topics for {repo_owner}/{repo_name}: {e}")
        return []

def get_github_stars(repo_path):
    """Get the star count for a GitHub repository."""
    try:
        # Extract owner and repo from the path
        path_parts = repo_path.split('/')
        if len(path_parts) < 2:
            return 0
        
        repo_owner, repo_name = path_parts[-2], path_parts[-1]
        
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
            return 0
            
        repo_data = response.json()
        return repo_data.get('stargazers_count', 0)
    except Exception as e:
        logger.warning(f"Failed to get star count for {repo_path}: {e}")
        return 0

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
            
            # Check for rate limiting
            if response.status_code == 403 and 'rate limit' in response.text.lower():
                reset_time = int(response.headers.get('X-RateLimit-Reset', 0))
                current_time = time.time()
                sleep_time = max(reset_time - current_time, GITHUB_API_RATE_LIMIT_WAIT)
                logger.warning(f"GitHub API rate limit reached. Waiting for {sleep_time} seconds...")
                time.sleep(sleep_time)
                # Continue with the next file
                continue
            
            if response.status_code == 200:
                content = response.text
                
                # Look for Docker image references
                docker_matches = re.findall(r'(?:docker\s+pull\s+|docker\.io/|image:\s+)?([\\w\\-\\_\\.\\/]+:[\\w\\-\\_\\.]+)', content)
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
        'source': 'github',
        'stars': repo_data.get('stargazers_count', 0)  # Get star count directly from repo_data
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

def update_existing_servers_with_stars(existing_servers):
    """Update existing servers with star counts if they don't have them already."""
    servers_updated = 0
    
    for server in existing_servers:
        # If the server has a GitHub URL but no star count, add it
        if server.get('github_url') and not server.get('stars'):
            # Extract the GitHub repository path from the URL
            url_parts = server['github_url'].split('github.com/')
            if len(url_parts) > 1:
                repo_path = url_parts[1]
                # Get the star count and update the server
                stars = get_github_stars(repo_path)
                server['stars'] = stars
                servers_updated += 1
                logger.info(f"Updated star count for {server['name']}: {stars} stars")
                # Add a small delay to avoid rate limiting
                time.sleep(0.5)
    
    logger.info(f"Updated star counts for {servers_updated} existing servers")
    return existing_servers

def update_yaml_file(repo, content_file, existing_servers, new_servers):
    """Update the YAML file with new servers and push to GitHub."""
    # First, update existing servers with star counts if they don't have them
    updated_existing_servers = update_existing_servers_with_stars(existing_servers)
    
    if not new_servers:
        # Even if there are no new servers, we might have updated star counts
        if updated_existing_servers == existing_servers:
            logger.info("No changes to make to the YAML file.")
            return
        logger.info("Updating YAML file with star counts for existing servers.")
    else:
        logger.info(f"Adding {len(new_servers)} new servers to the YAML file.")
    
    # Add new servers to the list
    updated_servers = updated_existing_servers + new_servers
    
    # Convert to YAML
    yaml_content = "# Model Context Protocol Servers\n"
    yaml_content += "# Format:\n"
    yaml_content += "# - name: Name of the MCP server\n"
    yaml_content += "#   description: A brief description of the server's features or purpose\n"
    yaml_content += "#   github_url: Link to the GitHub repository\n"
    yaml_content += "#   docker_image: Docker image name and tag\n"
    yaml_content += "#   website: Optional website URL\n"
    yaml_content += "#   tags: List of relevant tags\n"
    yaml_content += "#   stars: GitHub star count\n"
    yaml_content += "#   added_date: When the entry was added (YYYY-MM-DD)\n\n"
    
    # Add servers to YAML content
    yaml_content += yaml.dump(updated_servers, default_flow_style=False, sort_keys=False)
    
    try:
        # Create commit message based on what changed
        if new_servers:
            commit_message = f"Add {len(new_servers)} new MCP server{'s' if len(new_servers) > 1 else ''} and update star counts"
        else:
            commit_message = "Update GitHub star counts for MCP servers"
            
        # Commit the changes
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
    logger.info("Starting MCP server update process (GitHub-only)")
    
    # Initialize API clients
    github_repo = get_github_client()
    
    # Get existing servers
    existing_servers, content_file = get_existing_servers(github_repo)
    logger.info(f"Found {len(existing_servers)} existing MCP servers")
    
    # Get potential servers from GitHub
    all_new_servers = []
    
    # Get servers from GitHub
    github_servers = get_mcp_servers_from_github()
    for server in github_servers:
        if is_new_server(server, existing_servers) and is_new_server(server, all_new_servers):
            logger.info(f"Found new MCP server from GitHub: {server['name']} with {server['stars']} stars")
            all_new_servers.append(server)
    
    # Update YAML file with all new servers
    if all_new_servers:
        logger.info(f"Found {len(all_new_servers)} total new MCP servers to add")
        update_yaml_file(github_repo, content_file, existing_servers, all_new_servers)
    else:
        logger.info("No new MCP servers found from GitHub")
        # Still update star counts for existing servers
        update_yaml_file(github_repo, content_file, existing_servers, [])
    
    logger.info("MCP server update process completed")

if __name__ == "__main__":
    main()
