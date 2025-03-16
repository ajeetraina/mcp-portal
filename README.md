# Docker MCP Community Portal

A modern, community-driven collection of Docker Model Context Protocol (MCP) servers, tools, and resources. This repository powers the website at [ajeetraina.github.io/docker-mcp-portal](https://ajeetraina.github.io/docker-mcp-portal).

## About

The Docker MCP Community Portal aims to be the most comprehensive, up-to-date resource for Docker implementations of the Model Context Protocol (MCP). MCP is a protocol designed to enable large language models (LLMs) like Claude to interact with external tools and data sources, and this portal specifically focuses on Docker-related MCP servers and tools.

The Docker MCP Portal improves upon the traditional "awesome list" format by providing:

- A modern, responsive web interface
- Filtering and search capabilities
- Detailed information about each Docker MCP server
- Simple contribution process through pull requests

## What is the Model Context Protocol (MCP)?

The Model Context Protocol (MCP) is an open protocol that enables AI assistants such as Claude, ChatGPT, and others to interact with external tools and data sources in a structured way. In the case of Docker MCP implementations, these servers allow AI assistants to manage Docker containers, networks, volumes, images, and other Docker resources through natural language interactions.

Some key capabilities of Docker MCP servers include:

- Container lifecycle management (create, start, stop, remove)
- Image handling (build, pull, push, list)
- Volume and network operations
- Docker Compose workflow management
- Resource monitoring and inspection
- Security controls and access management

## Contributing

We welcome contributions! To add your Docker MCP server or tool to the list:

1. Fork this repository
2. Add your entry to `_data/mcp_servers.yml` or `_data/mcp_tools.yml`
3. Submit a pull request

For detailed instructions, please see [CONTRIBUTING.md](CONTRIBUTING.md).

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- All contributors who have submitted their Docker MCP implementations
- The [Collabnix](https://collabnix.com) community
- Docker for creating the Model Context Protocol implementation
- Anthropic for developing the Model Context Protocol standard
