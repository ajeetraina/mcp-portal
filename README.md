# MCP Community Portal

A modern, community-driven collection of Model Context Protocol (MCP) servers, tools, and resources. This repository powers the website at [ajeetraina.github.io/docker-mcp-portal](https://mcp.collabnix.com).

## About

The MCP Community Portal aims to be the most comprehensive, up-to-date resource for integration with the Model Context Protocol (MCP). This portal showcases how Docker provides containerized MCP servers and integrates them with tools like Gordon AI.

## What is the Model Context Protocol (MCP) and Docker's Role?

The Model Context Protocol (MCP) is an open protocol designed by Anthropic that enables AI assistants such as Claude to interact with external tools and data sources in a standardized way.

**Docker's role with MCP includes:**

- **Official Container Images**: Docker has partnered with Anthropic to build and maintain container images for MCP servers, available on Docker Hub under the `mcp/` namespace
- **Gordon AI Integration**: Docker's CLI AI assistant "Gordon" can interact with MCP servers through a `gordon-mcp.yml` configuration file (which is a Docker Compose file)
- **Security and Isolation**: Running MCP servers as containers provides security, isolation, and resource management benefits
- **Extensibility**: Users can leverage Docker Compose's features to extend MCP server capabilities with bind mounts, environment variables, and other Docker features

## MCP Servers Available on Docker Hub

Docker Hub hosts various MCP servers under the `mcp/` namespace, including:

- **mcp/time**: Provides time-related capabilities for AI assistants
- **mcp/fetch**: Enables web content retrieval
- **mcp/filesystem**: Allows secure file operations with configurable access controls
- **mcp/postgres**: Provides database interaction capabilities
- **mcp/git**: Enables Git repository management
- **mcp/sqlite**: Offers SQLite database interaction
- **mcp/github**: Facilitates GitHub repository management

And many more, which are cataloged and documented in this portal.

## Contributing

We welcome contributions! To add an MCP server or tool to the list:

1. Fork this repository
2. Add your entry to `_data/mcp_servers.yml` or `_data/mcp_tools.yml`
3. Submit a pull request
4. Preview your changes with our PR preview system before they're merged

For detailed instructions, please see [CONTRIBUTING.md](CONTRIBUTING.md).

## PR Preview Feature

When you submit a pull request, our automated system builds a preview of the site with your changes. This allows you to see exactly how your contribution will appear on the live site before it's merged. A comment with a preview link will be automatically added to your PR once the build is complete.

## Local Development

To run this site locally:

1. Install [Jekyll](https://jekyllrb.com/docs/installation/)
2. Clone this repository
3. Run `bundle install`
4. Run `bundle exec jekyll serve`
5. Open `http://localhost:4000` in your browser

## Features

- **Modern UI**: Clean, responsive design
- **Filtering**: Filter by tags, search by name
- **Sorting**: Sort by date added, alphabetically
- **One-click copy**: Copy Docker pull commands with a single click
- **Community-driven**: Easy contribution process
- **Mobile-friendly**: Works on all devices
- **PR Preview**: See your changes live before they're merged

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- All contributors who have submitted their MCP implementations
- The [Collabnix](https://collabnix.com) community
- Docker for creating container images for MCP servers
- Anthropic for developing the Model Context Protocol standard
