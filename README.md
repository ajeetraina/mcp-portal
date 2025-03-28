# MCP Community Portal

A modern, community-driven collection of Model Context Protocol (MCP) servers, tools, and resources. This repository powers the website at [https://mcp.collabnix.com](https://mcp.collabnix.com).

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

## Running Locally

### Using Docker (Recommended)

The easiest way to run this website locally is using Docker, which avoids Ruby environment setup issues:

1. Make sure you have [Docker](https://www.docker.com/get-started/) installed

2. Clone this repository:
   ```bash
   git clone https://github.com/ajeetraina/mcp-portal.git
   cd mcp-portal
   ```

3. Create a `docker-compose.yml` file in the repository root with the following content:
   ```yaml
   version: '3'
   services:
     jekyll:
       image: jekyll/jekyll:latest
       platform: linux/arm64  # For Apple Silicon Macs, use linux/amd64 for Intel Macs
       command: jekyll serve --livereload
       ports:
         - 4000:4000
         - 35729:35729
       volumes:
         - .:/srv/jekyll
   ```

4. Run the application with Docker Compose:
   ```bash
   docker-compose up
   ```

5. Access the site at http://localhost:4000

6. When you make changes to the source files, Jekyll will automatically rebuild the site and refresh your browser.

### Using Ruby and Jekyll directly

If you prefer not to use Docker:

1. Install [Jekyll](https://jekyllrb.com/docs/installation/)
2. Clone this repository
3. Run `bundle install`
4. Run `bundle exec jekyll serve`
5. Open `http://localhost:4000` in your browser

## Troubleshooting

### Platform Issues with Docker

If you encounter a platform mismatch error (e.g., on Apple Silicon Macs):

1. Update the `platform` field in your docker-compose.yml:
   - For Apple Silicon (ARM64): `platform: linux/arm64`
   - For Intel Macs (x86_64): `platform: linux/amd64`

2. Alternatively, build a custom image:
   ```yaml
   version: '3'
   services:
     jekyll:
       build: .
       ports:
         - 4000:4000
       volumes:
         - .:/srv/jekyll
   ```

   With a Dockerfile:
   ```
   FROM ruby:3.1-slim
   WORKDIR /srv/jekyll
   RUN apt-get update && apt-get install -y build-essential
   COPY Gemfile* ./
   RUN bundle install
   EXPOSE 4000
   CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0"]
   ```

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
