#!/usr/bin/env python3
"""
MCP Server/Tools Fetcher from Awesome-MCP-Servers

This script fetches MCP server and tool information from the punkpeye/awesome-mcp-servers repository
and updates the _data/mcp_servers.yml and _data/mcp_tools.yml files in the mcp-portal repository.

Requirements:
- requests
- pyyaml
- github3.py
- beautifulsoup4

Usage:
python fetch_from_awesome_mcp.py

Environment variables:
- GITHUB_TOKEN: GitHub personal access token
- GITHUB_REPO_OWNER: GitHub repository owner (username)
- GITHUB_REPO_NAME: GitHub repository name
"""

import os
import re
import sys
import yaml
import requests
import logging
from datetime import datetime
from github3 import login
from bs4 import BeautifulSoup

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger('mcp-fetcher')

# Constants
MCP_SERVERS_YAML_PATH = '_data/mcp_servers.yml'
MCP_TOOLS_YAML_PATH = '_data/mcp_tools.yml'
AWESOME_MCP_REPO = 'punkpeye/awesome-mcp-servers'
REPO_BRANCH = 'main'

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

def get_existing_data(repo, file_path):
    """Fetch existing data from the YAML file in the repository."""
    try:
        content = repo.file_contents(
            file_path,
            ref=REPO_BRANCH
        )
        yaml_content = content.decoded.decode('utf-8')
        return yaml.safe_load(yaml_content) or [], content
    except Exception as e:
        logger.error(f"Failed to fetch existing data from {file_path}: {e}")
        return [], None

def fetch_awesome_mcp_readme():
    """Fetch the README from the awesome-mcp-servers repository."""
    try:
        url = f"https://raw.githubusercontent.com/{AWESOME_MCP_REPO}/main/README.md"
        response = requests.get(url)
        response.raise_for_status()
        return response.text
    except Exception as e:
        logger.error(f"Failed to fetch README from {AWESOME_MCP_REPO}: {e}")
        sys.exit(1)

def extract_github_info(repo_url):
    """Extract GitHub owner and repo name from URL."""
    if not repo_url or 'github.com' not in repo_url:
        return None, None
    
    pattern = r'github\.com\/([^\/]+)\/([^\/\s]+)'
    match = re.search(pattern, repo_url)
    if match:
        return match.group(1), match.group(2)
    
    return None, None

def extract_server_entries(readme_text):
    """Extract server entries from the README."""
    # Convert README markdown to HTML for easier parsing
    soup = BeautifulSoup(f"<html><body>{readme_text}</body></html>", 'html.parser')
    
    # Find all server implementation sections
    servers = []
    
    # Regular expression to match server entries in the format: -
    # [@username/repo-name](https://github.com/username/repo-name) 🐍 🏠 - Description
    # or
    # [name](https://github.com/username/repo-name) 🐍 🏠 - Description
    server_regex = r'\-\s+\[([^\]]+)\]\(([^)]+)\)\s*(.*?)\s+\-\s+(.*?)(?:\n|$)'
    matches = re.findall(server_regex, readme_text, re.MULTILINE)
    
    for match in matches:
        name, url, tags, description = match
        
        # Skip if it doesn't look like a server
        if not url or not description:
            continue
        
        # Extract GitHub info if available
        github_owner, github_repo = extract_github_info(url)
        github_url = f"https://github.com/{github_owner}/{github_repo}" if github_owner and github_repo else None
        
        # Extract tags from emoji symbols
        tag_list = []
        if '🐍' in tags:
            tag_list.append('python')
        if '📇' in tags:
            tag_list.append('typescript')
        if '🏎️' in tags:
            tag_list.append('go')
        if '🦀' in tags:
            tag_list.append('rust')
        if '#️⃣' in tags:
            tag_list.append('csharp')
        if '☕' in tags:
            tag_list.append('java')
        if '☁️' in tags:
            tag_list.append('cloud')
        if '🏠' in tags:
            tag_list.append('local')
        if '🍎' in tags:
            tag_list.append('macos')
        if '🪟' in tags:
            tag_list.append('windows')
        if '🐧' in tags:
            tag_list.append('linux')
            
        # Add common tags
        tag_list.append('mcp')
        tag_list.append('server')
        
        # Create server entry
        server_entry = {
            'name': name.strip(),
            'description': description.strip(),
            'github_url': github_url,
            'website': url if not github_url else '',
            'tags': tag_list,
            'added_date': datetime.now().strftime('%Y-%m-%d'),
            'source': 'awesome-mcp-servers'
        }
        
        servers.append(server_entry)
    
    return servers

def extract_framework_entries(readme_text):
    """Extract framework entries from the README."""
    # Look for the Frameworks section
    frameworks_section_match = re.search(r'## Frameworks[\s\S]*?(?=##|$)', readme_text)
    if not frameworks_section_match:
        return []
    
    frameworks_section = frameworks_section_match.group(0)
    
    # Extract framework entries using the same pattern as server entries
    framework_regex = r'\-\s+\[([^\]]+)\]\(([^)]+)\)\s*(.*?)\s+\-\s+(.*?)(?:\n|$)'
    matches = re.findall(framework_regex, frameworks_section, re.MULTILINE)
    
    frameworks = []
    for match in matches:
        name, url, tags, description = match
        
        # Skip if it doesn't look like a framework
        if not url or not description:
            continue
        
        # Extract GitHub info if available
        github_owner, github_repo = extract_github_info(url)
        github_url = f"https://github.com/{github_owner}/{github_repo}" if github_owner and github_repo else None
        
        # Extract language from emoji symbols
        language = None
        if '🐍' in tags:
            language = 'Python'
        elif '📇' in tags:
            language = 'TypeScript'
        elif '🏎️' in tags:
            language = 'Go'
        elif '🦀' in tags:
            language = 'Rust'
        elif '#️⃣' in tags:
            language = 'C#'
        elif '☕' in tags:
            language = 'Java'
        else:
            language = 'Unknown'
        
        # Create framework entry
        framework_entry = {
            'name': name.strip(),
            'description': description.strip(),
            'github_url': github_url,
            'category': 'framework',
            'language': language,
            'tags': ['framework', 'mcp', language.lower()],
            'added_date': datetime.now().strftime('%Y-%m-%d')
        }
        
        frameworks.append(framework_entry)
    
    return frameworks

def extract_client_entries(readme_text):
    """Extract client entries from the README."""
    # Look for the Clients section
    clients_section_match = re.search(r'## Clients[\s\S]*?(?=##|$)', readme_text)
    if not clients_section_match:
        return []
    
    clients_section = clients_section_match.group(0)
    
    # Extract client entries
    client_regex = r'\-\s+\[([^\]]+)\]\(([^)]+)\)\s*(.*?)\s+\-\s+(.*?)(?:\n|$)'
    matches = re.findall(client_regex, clients_section, re.MULTILINE)
    
    clients = []
    for match in matches:
        name, url, tags, description = match
        
        # Skip if it doesn't look like a client
        if not url or not description:
            continue
        
        # Extract GitHub info if available
        github_owner, github_repo = extract_github_info(url)
        github_url = f"https://github.com/{github_owner}/{github_repo}" if github_owner and github_repo else None
        
        # Extract language from emoji symbols
        language = None
        if '🐍' in tags:
            language = 'Python'
        elif '📇' in tags:
            language = 'TypeScript'
        elif '🏎️' in tags:
            language = 'Go'
        elif '🦀' in tags:
            language = 'Rust'
        elif '#️⃣' in tags:
            language = 'C#'
        elif '☕' in tags:
            language = 'Java'
        else:
            language = 'Unknown'
        
        # Create client entry
        client_entry = {
            'name': name.strip(),
            'description': description.strip(),
            'github_url': github_url,
            'category': 'client',
            'language': language,
            'tags': ['client', 'mcp', language.lower()],
            'added_date': datetime.now().strftime('%Y-%m-%d')
        }
        
        clients.append(client_entry)
    
    return clients

def extract_utility_entries(readme_text):
    """Extract utility entries from the README."""
    # Look for the Utilities section
    utilities_section_match = re.search(r'## Utilities[\s\S]*?(?=##|$)', readme_text)
    if not utilities_section_match:
        return []
    
    utilities_section = utilities_section_match.group(0)
    
    # Extract utility entries
    utility_regex = r'\-\s+\[([^\]]+)\]\(([^)]+)\)\s*(.*?)\s+\-\s+(.*?)(?:\n|$)'
    matches = re.findall(utility_regex, utilities_section, re.MULTILINE)
    
    utilities = []
    for match in matches:
        name, url, tags, description = match
        
        # Skip if it doesn't look like a utility
        if not url or not description:
            continue
        
        # Extract GitHub info if available
        github_owner, github_repo = extract_github_info(url)
        github_url = f"https://github.com/{github_owner}/{github_repo}" if github_owner and github_repo else None
        
        # Extract language from emoji symbols
        language = None
        if '🐍' in tags:
            language = 'Python'
        elif '📇' in tags:
            language = 'TypeScript'
        elif '🏎️' in tags:
            language = 'Go'
        elif '🦀' in tags:
            language = 'Rust'
        elif '#️⃣' in tags:
            language = 'C#'
        elif '☕' in tags:
            language = 'Java'
        else:
            language = 'Unknown'
        
        # Create utility entry
        utility_entry = {
            'name': name.strip(),
            'description': description.strip(),
            'github_url': github_url,
            'category': 'utility',
            'language': language,
            'tags': ['utility', 'mcp', language.lower()],
            'added_date': datetime.now().strftime('%Y-%m-%d')
        }
        
        utilities.append(utility_entry)
    
    return utilities

def is_new_entry(entry, existing_entries):
    """Check if an entry is new and not already in the existing list."""
    for existing in existing_entries:
        # Check by GitHub URL
        if entry.get('github_url') and existing.get('github_url') == entry['github_url']:
            return False
        
        # Check by name similarity
        if entry['name'].lower() == existing.get('name', '').lower():
            return False
    
    return True

def categorize_servers(servers):
    """Categorize servers into working, untested, and unsupported based on available info."""
    working_servers = []
    untested_servers = []
    unsupported_servers = []
    
    for server in servers:
        # For simplicity, we'll consider all servers as working
        # In a real implementation, you might want to add logic to determine the status
        working_servers.append(server)
    
    return {
        'working_servers': working_servers,
        'untested_servers': untested_servers,
        'unsupported_servers': unsupported_servers
    }

def update_yaml_file(repo, content_file, path, existing_data, new_entries, is_server=False):
    """Update the YAML file with new entries and push to GitHub."""
    if not new_entries:
        logger.info(f"No new entries to add to {path}.")
        return
    
    # For server files, we need special handling due to the structure
    if is_server:
        # Categorize new servers
        categorized_servers = categorize_servers(new_entries)
        
        # Create updated data structure
        updated_data = {
            'working_servers': existing_data.get('working_servers', []) + categorized_servers['working_servers'],
            'untested_servers': existing_data.get('untested_servers', []) + categorized_servers['untested_servers'],
            'unsupported_servers': existing_data.get('unsupported_servers', []) + categorized_servers['unsupported_servers']
        }
    else:
        # For tools, we can simply combine existing and new data
        updated_data = existing_data + new_entries
    
    # Convert to YAML
    if is_server:
        yaml_content = yaml.dump(updated_data, default_flow_style=False, sort_keys=False)
    else:
        yaml_content = yaml.dump(updated_data, default_flow_style=False, sort_keys=False)
    
    try:
        # Commit the changes
        commit_message = f"Add {len(new_entries)} new MCP {'servers' if is_server else 'tools'} from awesome-mcp-servers"
        repo.update_file(
            path=path,
            message=commit_message,
            content=yaml_content,
            sha=content_file.sha,
            branch=REPO_BRANCH
        )
        logger.info(f"Successfully updated {path}: {commit_message}")
    except Exception as e:
        logger.error(f"Failed to update {path}: {e}")

def main():
    """Main function to fetch and update MCP servers and tools."""
    logger.info("Starting fetch from awesome-mcp-servers repository")
    
    # Initialize GitHub client
    repo = get_github_client()
    
    # Fetch README from awesome-mcp-servers
    readme_text = fetch_awesome_mcp_readme()
    
    # Get existing servers and tools data
    existing_servers, servers_content = get_existing_data(repo, MCP_SERVERS_YAML_PATH)
    existing_tools, tools_content = get_existing_data(repo, MCP_TOOLS_YAML_PATH)
    
    logger.info(f"Found {len(existing_servers.get('working_servers', []) + existing_servers.get('untested_servers', []) + existing_servers.get('unsupported_servers', []))} existing MCP servers")
    logger.info(f"Found {len(existing_tools)} existing MCP tools")
    
    # Extract entries from README
    server_entries = extract_server_entries(readme_text)
    framework_entries = extract_framework_entries(readme_text)
    client_entries = extract_client_entries(readme_text)
    utility_entries = extract_utility_entries(readme_text)
    
    logger.info(f"Extracted {len(server_entries)} server entries from README")
    logger.info(f"Extracted {len(framework_entries)} framework entries from README")
    logger.info(f"Extracted {len(client_entries)} client entries from README")
    logger.info(f"Extracted {len(utility_entries)} utility entries from README")
    
    # Identify new entries
    all_existing_servers = []
    if isinstance(existing_servers, dict):
        if 'working_servers' in existing_servers:
            all_existing_servers.extend(existing_servers['working_servers'])
        if 'untested_servers' in existing_servers:
            all_existing_servers.extend(existing_servers['untested_servers'])
        if 'unsupported_servers' in existing_servers:
            all_existing_servers.extend(existing_servers['unsupported_servers'])
    
    new_servers = [s for s in server_entries if is_new_entry(s, all_existing_servers)]
    new_tools = []
    new_tools.extend([t for t in framework_entries if is_new_entry(t, existing_tools)])
    new_tools.extend([t for t in client_entries if is_new_entry(t, existing_tools)])
    new_tools.extend([t for t in utility_entries if is_new_entry(t, existing_tools)])
    
    logger.info(f"Found {len(new_servers)} new servers to add")
    logger.info(f"Found {len(new_tools)} new tools to add")
    
    # Update YAML files
    if servers_content and new_servers:
        update_yaml_file(repo, servers_content, MCP_SERVERS_YAML_PATH, existing_servers, new_servers, is_server=True)
    
    if tools_content and new_tools:
        update_yaml_file(repo, tools_content, MCP_TOOLS_YAML_PATH, existing_tools, new_tools, is_server=False)
    
    logger.info("Fetch from awesome-mcp-servers repository completed")

if __name__ == "__main__":
    main()