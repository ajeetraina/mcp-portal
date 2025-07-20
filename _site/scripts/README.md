# MCP Servers Updater Script

This script automatically fetches new MCP server announcements from Reddit's r/mcp subreddit and updates the `_data/mcp_servers.yml` file in your repository.

## How It Works

1. The script connects to the Reddit API to fetch recent posts from r/mcp
2. It analyzes each post to extract MCP server information:
   - Name
   - Description
   - GitHub URL
   - Docker image
   - Website (if available)
   - Tags
3. If a new server is found (not already in the YAML file), it adds it to the file
4. Changes are automatically committed to the repository

## Setup

### 1. Create a Reddit API Application

1. Go to [Reddit's App Preferences](https://www.reddit.com/prefs/apps)
2. Click "Create App" or "Create Another App" at the bottom
3. Fill in the details:
   - Name: `mcp-updater` (or any name you prefer)
   - App type: `script`
   - Description: `Script to update MCP servers list`
   - About URL: Your repository URL
   - Redirect URI: `http://localhost:8080` (not used but required)
4. Click "Create app"
5. Note down the Client ID (under the app name) and Client Secret

### 2. Set up GitHub Repository Secrets

Add the following secrets to your repository (Settings > Secrets and variables > Actions):

1. `REDDIT_CLIENT_ID`: Your Reddit API client ID
2. `REDDIT_CLIENT_SECRET`: Your Reddit API client secret
3. `GH_PERSONAL_TOKEN`: A GitHub personal access token with repo permissions

Add the following repository variables:

1. `REDDIT_USERNAME`: Your Reddit username (used in user agent string)

### 3. Enable GitHub Actions

The workflow is already set up to run every 6 hours. You can also trigger it manually from the Actions tab.

## Customization

You can customize the script by modifying the constants at the top:

```python
# Constants
YAML_FILE_PATH = '_data/mcp_servers.yml'
REPO_BRANCH = 'main'
SUBREDDIT_NAME = 'mcp'
MAX_POSTS = 100  # Maximum number of posts to fetch
POST_TIMEFRAME = 'week'  # 'day', 'week', 'month', 'year', 'all'
```

Feel free to adjust the subreddit name, post timeframe, or other parameters as needed.

## Manual Execution

You can also run the script manually:

```bash
# Install dependencies
pip install praw pyyaml github3.py

# Set environment variables
export REDDIT_CLIENT_ID="your_client_id"
export REDDIT_CLIENT_SECRET="your_client_secret"
export REDDIT_USER_AGENT="script:mcp-updater:v1.0 (by u/your_username)"
export GITHUB_TOKEN="your_github_token"
export GITHUB_REPO_OWNER="your_github_username"
export GITHUB_REPO_NAME="docker-mcp-portal"

# Run the script
python update_mcp_servers.py
```

## Troubleshooting

If you encounter issues:

1. Check the GitHub Actions logs for error messages
2. Verify that your Reddit API credentials are correct
3. Make sure your GitHub token has sufficient permissions
4. Check if the Reddit API is rate limiting your requests