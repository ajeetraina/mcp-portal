/**
 * MCP Tools Collection Script
 * 
 * This script searches GitHub for MCP-related repositories,
 * extracts metadata, and formats them for the MCP portal.
 * 
 * Usage: node collect_mcp_tools.js
 */

// Use in Node.js environment with fetch
// npm install node-fetch
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml'); // npm install js-yaml

// GitHub API search queries
const SEARCH_QUERIES = [
  'topic:mcp-server',
  'topic:model-context-protocol',
  'model-context-protocol',
  'mcp-server',
  'mcp server implementation',
  'anthropic+mcp',
  'claude+mcp'
];

// Categories mapping based on repository description
const CATEGORIES_KEYWORDS = {
  'cli': ['cli', 'command line', 'terminal'],
  'framework': ['framework', 'library', 'sdk'],
  'utility': ['utility', 'tool', 'helper'],
  'integration': ['integration', 'connector', 'bridge'],
  'extension': ['extension', 'plugin', 'addon'],
  'monitoring': ['monitor', 'dashboard', 'observability'],
  'testing': ['test', 'benchmark', 'validation'],
  'security': ['security', 'auth', 'permission'],
  'examples': ['example', 'sample', 'demo']
};

// Language detection based on repository
const detectLanguage = (repo) => {
  if (repo.language) {
    return repo.language;
  }
  
  // Try to detect from the name or description
  const nameAndDesc = (repo.name + ' ' + repo.description).toLowerCase();
  
  if (nameAndDesc.includes('typescript') || nameAndDesc.includes('ts-')) return 'TypeScript';
  if (nameAndDesc.includes('javascript') || nameAndDesc.includes('js-')) return 'JavaScript';
  if (nameAndDesc.includes('python') || nameAndDesc.includes('py-')) return 'Python';
  if (nameAndDesc.includes('golang') || nameAndDesc.includes('go-')) return 'Go';
  if (nameAndDesc.includes('rust') || nameAndDesc.includes('rs-')) return 'Rust';
  if (nameAndDesc.includes('java')) return 'Java';
  if (nameAndDesc.includes('csharp') || nameAndDesc.includes('c#')) return 'C#';
  
  return 'Unknown';
};

// Category detection based on repository
const detectCategory = (repo) => {
  const nameAndDesc = (repo.name + ' ' + repo.description).toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORIES_KEYWORDS)) {
    for (const keyword of keywords) {
      if (nameAndDesc.includes(keyword)) {
        return category;
      }
    }
  }
  
  // Default category based on common patterns
  if (nameAndDesc.includes('server')) return 'framework';
  if (nameAndDesc.includes('client')) return 'library';
  if (nameAndDesc.includes('ui') || nameAndDesc.includes('gui')) return 'utility';
  
  return 'utility'; // Default fallback
};

// Extract tags from repository
const extractTags = (repo) => {
  const tags = new Set();
  const nameAndDesc = (repo.name + ' ' + repo.description).toLowerCase();
  
  // Add language as a tag
  const language = detectLanguage(repo);
  if (language && language !== 'Unknown') {
    tags.add(language.toLowerCase());
  }
  
  // Add category as a tag
  const category = detectCategory(repo);
  tags.add(category);
  
  // Add common tags based on content
  if (nameAndDesc.includes('claude')) tags.add('claude');
  if (nameAndDesc.includes('anthropic')) tags.add('anthropic');
  if (nameAndDesc.includes('docker')) tags.add('docker');
  if (nameAndDesc.includes('kubernetes') || nameAndDesc.includes('k8s')) tags.add('kubernetes');
  if (nameAndDesc.includes('server')) tags.add('server');
  if (nameAndDesc.includes('client')) tags.add('client');
  if (nameAndDesc.includes('proxy')) tags.add('proxy');
  if (nameAndDesc.includes('gateway')) tags.add('gateway');
  if (nameAndDesc.includes('stdio')) tags.add('stdio');
  if (nameAndDesc.includes('sse')) tags.add('sse');
  if (nameAndDesc.includes('websocket') || nameAndDesc.includes('ws')) tags.add('websocket');
  if (nameAndDesc.includes('http')) tags.add('http');
  if (nameAndDesc.includes('ai')) tags.add('ai');
  if (nameAndDesc.includes('llm')) tags.add('llm');
  
  // Extract GitHub topics if available
  if (repo.topics && repo.topics.length > 0) {
    repo.topics.forEach(topic => {
      if (topic !== 'mcp' && topic !== 'model-context-protocol') {
        tags.add(topic);
      }
    });
  }
  
  return Array.from(tags).slice(0, 5); // Limit to 5 most relevant tags
};

// Format date to YYYY-MM-DD
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// Convert repository to MCP tool format
const repoToMcpTool = (repo) => {
  const language = detectLanguage(repo);
  const category = detectCategory(repo);
  const tags = extractTags(repo);
  const date = formatDate(repo.created_at || new Date());
  
  return {
    name: repo.name.replace(/-/g, ' ').replace(/mcp/i, 'MCP').replace(/\b\w/g, l => l.toUpperCase()),
    description: repo.description || `A ${category} for the Model Context Protocol`,
    github_url: repo.html_url,
    category: category,
    language: language,
    tags: tags,
    added_date: date
  };
};

// Search GitHub for MCP repositories
const searchGitHub = async (query, page = 1) => {
  const endpoint = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&page=${page}&per_page=100`;
  
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MCP-Portal-Tool-Collector'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}: ${await response.text()}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error searching GitHub for "${query}": ${error.message}`);
    return { items: [] };
  }
};

// Main function to collect MCP tools
const collectMcpTools = async () => {
  console.log('Collecting MCP tools from GitHub...');
  
  const allRepos = new Map(); // Use Map to deduplicate by URL
  
  // Search GitHub for each query
  for (const query of SEARCH_QUERIES) {
    console.log(`Searching for "${query}"...`);
    
    try {
      const result = await searchGitHub(query);
      
      if (result.items && result.items.length > 0) {
        console.log(`Found ${result.items.length} repositories for "${query}"`);
        
        // Add repos to the map, using URL as key to deduplicate
        result.items.forEach(repo => {
          if (repo.html_url && 
              !repo.html_url.includes('anthropic-ai') && // Skip official repos
              !repo.html_url.includes('anthropics') && 
              !allRepos.has(repo.html_url)) {
            allRepos.set(repo.html_url, repo);
          }
        });
      }
    } catch (error) {
      console.error(`Error processing query "${query}": ${error.message}`);
    }
  }
  
  console.log(`Found ${allRepos.size} unique MCP related repositories.`);
  
  // Convert repositories to MCP tool format
  const mcpTools = Array.from(allRepos.values())
    .map(repoToMcpTool)
    .sort((a, b) => new Date(b.added_date) - new Date(a.added_date)); // Sort by date, newest first
  
  return mcpTools;
};

// Write tools to YAML file
const writeToolsToYaml = (tools, outputPath) => {
  try {
    const yamlHeader = '# Model Context Protocol Tools\n# Format:\n# - name: Name of the MCP tool\n#   description: A brief description of the tool\'s features or purpose\n#   github_url: Link to the GitHub repository\n#   category: Tool category (e.g., cli, integration, library, etc.)\n#   language: Programming language of the tool\n#   tags: List of relevant tags\n#   added_date: When the entry was added (YYYY-MM-DD)\n\n';
    
    const toolsYaml = yaml.dump(tools, {
      indent: 2,
      lineWidth: -1,
      quotingType: '"'
    });
    
    fs.writeFileSync(outputPath, yamlHeader + toolsYaml, 'utf8');
    console.log(`Successfully wrote ${tools.length} MCP tools to ${outputPath}`);
  } catch (error) {
    console.error(`Error writing tools to YAML: ${error.message}`);
  }
};

// Main execution
async function main() {
  try {
    const tools = await collectMcpTools();
    const outputDir = path.resolve(__dirname, '../_data');
    const outputFile = path.join(outputDir, 'new_mcp_tools.yml');
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    writeToolsToYaml(tools, outputFile);
  } catch (error) {
    console.error(`Unhandled error: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();
