# Countries Directory

This directory contains information about country-specific MCP servers. Each HTML file represents a different country and lists the MCP servers available for that location.

## File Naming Convention

Files are named using the ISO 3166-1 alpha-2 country code followed by `.html` extension:

- `sg.html` - Singapore
- `us.html` - United States
- `cn.html` - China
- `hk.html` - Hong Kong
- etc.

## Adding a New Country

To add a new country to the directory, create a new HTML file named after the country's ISO 3166-1 alpha-2 code, following the template of existing files.

Additionally, add the country's flag SVG to the `../assets/images/flags/` directory and update the `../data/mcp-servers.json` file with the country's information.

## Contributing Guidelines

Please see the main [CONTRIBUTING.md](/CONTRIBUTING.md) file for instructions on how to contribute new country-specific MCP servers to this directory.
