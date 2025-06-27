import React from 'react';

const MCPLandscape = () => {
  return (
    <div className="bg-gray-50 p-6 font-sans">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-indigo-600 mb-2">Model Context Protocol (MCP) Landscape</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          An ecosystem map of the Model Context Protocol - the open standard for connecting AI models with external tools and data sources
        </p>
      </header>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">MCP Architecture</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xl font-semibold text-indigo-600 mb-2">MCP Hosts</h3>
            <p className="text-gray-600 mb-3">Applications that users interact with directly</p>
            <div className="space-y-1">
              <div className="bg-indigo-50 p-2 rounded">Claude Desktop</div>
              <div className="bg-indigo-50 p-2 rounded">Cursor</div>
              <div className="bg-indigo-50 p-2 rounded">Zed</div>
              <div className="bg-indigo-50 p-2 rounded">Witsy</div>
              <div className="bg-indigo-50 p-2 rounded">Theia AI</div>
              <div className="bg-indigo-50 p-2 rounded">5ire</div>
              <div className="bg-indigo-50 p-2 rounded">Cody (Sourcegraph)</div>
              <div className="bg-indigo-50 p-2 rounded">SpinAI</div>
              <div className="bg-indigo-50 p-2 rounded">Superinterface</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">MCP Clients</h3>
            <p className="text-gray-600 mb-3">Intermediaries between hosts and servers</p>
            <div className="space-y-1">
              <div className="bg-blue-50 p-2 rounded">MCP-use</div>
              <div className="bg-blue-50 p-2 rounded">MCPHub</div>
              <div className="bg-blue-50 p-2 rounded">AgentAI</div>
              <div className="bg-blue-50 p-2 rounded">OpenCTX</div>
              <div className="bg-blue-50 p-2 rounded">MCP Frameworks</div>
              <div className="bg-blue-50 p-2 rounded">MCP Python SDK</div>
              <div className="bg-blue-50 p-2 rounded">MCP TypeScript SDK</div>
              <div className="bg-blue-50 p-2 rounded">MCP C# SDK</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xl font-semibold text-green-600 mb-2">MCP Servers</h3>
            <p className="text-gray-600 mb-3">Expose external data and tools to MCP clients</p>
            <div className="space-y-1">
              <div className="bg-green-50 p-2 rounded">1000+ Community MCP Servers</div>
              <div className="bg-green-50 p-2 rounded">Official Reference Implementations</div>
              <div className="bg-green-50 p-2 rounded">Cloudflare Remote MCP Servers</div>
              <div className="bg-green-50 p-2 rounded">FastAPI to MCP Generator</div>
              <div className="bg-green-50 p-2 rounded">Template MCP Server</div>
              <div className="bg-green-50 p-2 rounded">MCP-Framework</div>
              <div className="bg-green-50 p-2 rounded">Higress MCP Server Hosting</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">MCP Clients (Application Categories)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xl font-semibold text-purple-600 mb-2">Chat Applications</h3>
            <div className="space-y-1">
              <div className="bg-purple-50 p-2 rounded flex items-center">
                <span className="mr-2">Claude Desktop</span>
                <span className="text-xs bg-purple-200 px-2 rounded-full">Anthropic</span>
              </div>
              <div className="bg-purple-50 p-2 rounded">LibreChat</div>
              <div className="bg-purple-50 p-2 rounded">5ire</div>
              <div className="bg-purple-50 p-2 rounded">Witsy</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xl font-semibold text-yellow-600 mb-2">Code Editors & IDEs</h3>
            <div className="space-y-1">
              <div className="bg-yellow-50 p-2 rounded">Cursor</div>
              <div className="bg-yellow-50 p-2 rounded">Zed</div>
              <div className="bg-yellow-50 p-2 rounded">MCPHub (Neovim)</div>
              <div className="bg-yellow-50 p-2 rounded">Theia IDE</div>
              <div className="bg-yellow-50 p-2 rounded">Cody (Sourcegraph)</div>
              <div className="bg-yellow-50 p-2 rounded">Codeium</div>
              <div className="bg-yellow-50 p-2 rounded">Replit</div>
              <div className="bg-yellow-50 p-2 rounded">Continue</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xl font-semibold text-red-600 mb-2">Agent Frameworks</h3>
            <div className="space-y-1">
              <div className="bg-red-50 p-2 rounded">SpinAI</div>
              <div className="bg-red-50 p-2 rounded">AgentAI</div>
              <div className="bg-red-50 p-2 rounded">MCP-use</div>
              <div className="bg-red-50 p-2 rounded">OpenCTX</div>
              <div className="bg-red-50 p-2 rounded">Superinterface</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">MCP Servers (Tool Categories)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Database & Storage</h3>
            <div className="space-y-1">
              <div className="bg-blue-50 p-2 rounded">PostgreSQL</div>
              <div className="bg-blue-50 p-2 rounded">SQLite</div>
              <div className="bg-blue-50 p-2 rounded">ClickHouse</div>
              <div className="bg-blue-50 p-2 rounded">Convex</div>
              <div className="bg-blue-50 p-2 rounded">Neon</div>
              <div className="bg-blue-50 p-2 rounded">DevDb</div>
              <div className="bg-blue-50 p-2 rounded">Supabase</div>
              <div className="bg-blue-50 p-2 rounded">Tinybird</div>
              <div className="bg-blue-50 p-2 rounded">Upstash</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xl font-semibold text-green-600 mb-2">Collaboration & Productivity</h3>
            <div className="space-y-1">
              <div className="bg-green-50 p-2 rounded">Google Drive</div>
              <div className="bg-green-50 p-2 rounded">Slack</div>
              <div className="bg-green-50 p-2 rounded">GitHub</div>
              <div className="bg-green-50 p-2 rounded">GitLab</div>
              <div className="bg-green-50 p-2 rounded">Notion</div>
              <div className="bg-green-50 p-2 rounded">DevRev</div>
              <div className="bg-green-50 p-2 rounded">Linear</div>
              <div className="bg-green-50 p-2 rounded">Obsidian</div>
              <div className="bg-green-50 p-2 rounded">Kibela</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xl font-semibold text-purple-600 mb-2">Search & Web Access</h3>
            <div className="space-y-1">
              <div className="bg-purple-50 p-2 rounded">Brave Search</div>
              <div className="bg-purple-50 p-2 rounded">Exa</div>
              <div className="bg-purple-50 p-2 rounded">Firecrawl</div>
              <div className="bg-purple-50 p-2 rounded">Tavily</div>
              <div className="bg-purple-50 p-2 rounded">Puppeteer</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xl font-semibold text-red-600 mb-2">AI & Creative Tools</h3>
            <div className="space-y-1">
              <div className="bg-red-50 p-2 rounded">EverArt</div>
              <div className="bg-red-50 p-2 rounded">Blender-MCP</div>
              <div className="bg-red-50 p-2 rounded">Figma</div>
              <div className="bg-red-50 p-2 rounded">Deepseek R1</div>
              <div className="bg-red-50 p-2 rounded">Deepseek-thinker-mcp</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xl font-semibold text-yellow-600 mb-2">Development Tools</h3>
            <div className="space-y-1">
              <div className="bg-yellow-50 p-2 rounded">Git</div>
              <div className="bg-yellow-50 p-2 rounded">Filesystem</div>
              <div className="bg-yellow-50 p-2 rounded">GitHub</div>
              <div className="bg-yellow-50 p-2 rounded">GitLab</div>
              <div className="bg-yellow-50 p-2 rounded">Speakeasy</div>
              <div className="bg-yellow-50 p-2 rounded">Stainless</div>
              <div className="bg-yellow-50 p-2 rounded">AgentDesk</div>
              <div className="bg-yellow-50 p-2 rounded">BrowserTools</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xl font-semibold text-indigo-600 mb-2">DevOps & Monitoring</h3>
            <div className="space-y-1">
              <div className="bg-indigo-50 p-2 rounded">Sentry</div>
              <div className="bg-indigo-50 p-2 rounded">Grafana</div>
              <div className="bg-indigo-50 p-2 rounded">Kubernetes</div>
              <div className="bg-indigo-50 p-2 rounded">Kibana</div>
              <div className="bg-indigo-50 p-2 rounded">Kong Konnect</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xl font-semibold text-pink-600 mb-2">Business Tools</h3>
            <div className="space-y-1">
              <div className="bg-pink-50 p-2 rounded">Kintone</div>
              <div className="bg-pink-50 p-2 rounded">Resend (Email)</div>
              <div className="bg-pink-50 p-2 rounded">Stripe (Payments)</div>
              <div className="bg-pink-50 p-2 rounded">Braintrust (Evaluation)</div>
              <div className="bg-pink-50 p-2 rounded">Descope (Auth)</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xl font-semibold text-orange-600 mb-2">Agent Execution</h3>
            <div className="space-y-1">
              <div className="bg-orange-50 p-2 rounded">Browserbase</div>
              <div className="bg-orange-50 p-2 rounded">E2B</div>
              <div className="bg-orange-50 p-2 rounded">ForeverVM</div>
              <div className="bg-orange-50 p-2 rounded">ScrapyBara</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">MCP Infrastructure & Hosting</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xl font-semibold text-indigo-600 mb-2">Server Hosting</h3>
            <div className="space-y-1">
              <div className="bg-indigo-50 p-2 rounded">Cloudflare</div>
              <div className="bg-indigo-50 p-2 rounded">Smithery</div>
              <div className="bg-indigo-50 p-2 rounded">Azure Functions</div>
              <div className="bg-indigo-50 p-2 rounded">Composio</div>
              <div className="bg-indigo-50 p-2 rounded">Higress</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xl font-semibold text-green-600 mb-2">Server Generation</h3>
            <div className="space-y-1">
              <div className="bg-green-50 p-2 rounded">Mintlify</div>
              <div className="bg-green-50 p-2 rounded">Speakeasy</div>
              <div className="bg-green-50 p-2 rounded">Stainless</div>
              <div className="bg-green-50 p-2 rounded">FastAPI to MCP Generator</div>
              <div className="bg-green-50 p-2 rounded">Template MCP Server</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Connection Management</h3>
            <div className="space-y-1">
              <div className="bg-blue-50 p-2 rounded">Toolbase</div>
              <div className="bg-blue-50 p-2 rounded">MCP.so</div>
              <div className="bg-blue-50 p-2 rounded">MCP Inspector</div>
              <div className="bg-blue-50 p-2 rounded">MCP Framework</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">MCP Marketplace & Discovery</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xl font-semibold text-purple-600 mb-2">MCP Marketplace</h3>
            <div className="space-y-1">
              <div className="bg-purple-50 p-2 rounded">Glama</div>
              <div className="bg-purple-50 p-2 rounded">MCP.so</div>
              <div className="bg-purple-50 p-2 rounded">Mintlify / mcpt</div>
              <div className="bg-purple-50 p-2 rounded">OpenTools</div>
              <div className="bg-purple-50 p-2 rounded">Smithery</div>
              <div className="bg-purple-50 p-2 rounded">Composio</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="text-center text-gray-600 mt-10 pt-4 border-t">
        <p className="mb-2">Last updated: May 16, 2025</p>
        <p>
          <a href="https://github.com/ajeetraina/mcp-portal" className="text-indigo-600 hover:underline">
            View on GitHub
          </a> | 
          <a href="https://modelcontextprotocol.io" className="text-indigo-600 hover:underline ml-2">
            MCP Documentation
          </a>
        </p>
        <p className="mt-2 text-sm">
          This landscape is maintained by the community and may not represent all MCP projects.
          Contributions welcome!
        </p>
      </footer>
    </div>
  );
};

export default MCPLandscape;