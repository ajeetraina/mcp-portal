# Example Country Page Implementation

This document provides a complete example of how a country-specific MCP page is structured and displayed.

## Page Structure

Each country page consists of:

1. **Header Section**
   - Country flag
   - Country name
   - Region information
   - Support level indicator
   - Description

2. **Left Sidebar**
   - Regulatory framework information
   - Country-specific tools
   - Community links and resources

3. **Main Content**
   - List of MCP tools available in the country
   - Filtering options by tool category
   - Localization details for each tool

## Example Code

Here's an example of what the country page for India would look like:

```yaml
---
layout: country
title: MCP in India
country_code: IN
---
```

When rendered, this page pulls data from:

1. `_data/country_info.yml` to get India-specific information:
   ```yaml
   - code: IN
     name: India
     region: Asia
     flag_icon: in
     has_localization: true
     support_level: full
     community_link: https://github.com/ajeetraina/docker-mcp-portal/discussions/india
     regulations: Digital India AI compliance framework
     custom_tools:
       - bharat-mcp-tools
       - indic-language-mcp-support
     description: Rapidly growing MCP community with support for Indic languages and India-specific integrations.
   ```

2. `_data/mcp_tools_country.yml` to get tools available in India:
   ```yaml
   - tool_id: "FastMCP (Python)"
     countries: [US, GB, IN, DE, JP, CA, AU]
     localized_versions: true
     localization_notes: "Available in 12 languages including major European and Asian languages"
   
   - tool_id: "LiteMCP"
     countries: [US, GB, IN, SG, AU, AE]
     localized_versions: true
     localization_notes: "Partial localization for Indian languages and Arabic"
   
   # ... more tools ...
   ```

## Visual Presentation

The rendered page displays:

1. **Header**
   - ?? India (with flag)
   - Region: Asia
   - Support Level: Full Support (green badge)
   - Description about India's MCP ecosystem

2. **Regulatory Section**
   - Information about Digital India AI compliance framework
   - Compliance notes for developers

3. **India-specific Tools**
   - bharat-mcp-tools
   - indic-language-mcp-support

4. **Community Section**
   - Link to the India MCP community
   - Description of community resources

5. **Available Tools**
   - List of all MCP tools available in India
   - Filter options by category
   - Localization information for each tool

## User Experience

Users can:
1. Search for specific tools within the country
2. Filter tools by category
3. See which tools have localization for Indian languages
4. Access country-specific regulatory information
5. Connect with the local MCP community

## Integration with Overall Portal

The country pages are accessible via:
1. Direct links from the Countries overview page
2. Navigation menu in the header
3. Links from tool pages showing country availability

This integrated approach makes the country-specific information discoverable and enhances the global user experience of the MCP Portal.
