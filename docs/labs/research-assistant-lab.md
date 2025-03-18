---
layout: page
title: Lab 2: Building a Research Assistant with Docker MCP
---

# Lab 2: Building a Research Assistant with Docker MCP

In this intermediate-level lab, you'll create a powerful research assistant by configuring multiple Docker MCP servers working together. This lab simulates a practical real-world use case for AI assistants with MCP capabilities.

**Time to complete:** 45-60 minutes

**Prerequisites:**
- Completion of [Lab 1: First Steps with Docker MCP Servers](/docs/labs/mcp-101-lab)
- Docker Desktop installed
- GitHub account (optional but recommended for full functionality)

## Learning Objectives

By the end of this lab, you'll be able to:
1. Set up an integrated environment with multiple MCP servers
2. Configure secure access to web content and local files
3. Create a practical research workflow using Gordon AI
4. Understand how to structure complex queries for MCP-enabled AI assistants

## Step 1: Set Up Your Research Environment

Create a new directory for your research assistant project:

```bash
mkdir research-assistant
cd research-assistant
mkdir research-data
mkdir research-output
```

## Step 2: Configure Your Research Assistant MCP Servers

Create a `gordon-mcp.yml` file with the following content:

```yaml
services:
  time:
    image: mcp/time
  
  fetch:
    image: mcp/fetch
  
  fs:
    image: mcp/filesystem
    command:
      - /rootfs
    volumes:
      - ./research-data:/rootfs/data:ro
      - ./research-output:/rootfs/output:rw
  
  sqlite:
    image: mcp/sqlite
    volumes:
      - ./research-data:/data
```

Note how we're using read-only (`ro`) access for research data and write access (`rw`) only for the output directory, implementing security best practices.

## Step 3: Prepare Research Materials

Let's create some initial research data:

```bash
# Create a sample dataset
cat << EOF > research-data/climate_data.csv
Year,Global_Temp_Anomaly,CO2_PPM,Sea_Level_Change_mm
1980,0.27,338.80,0
1985,0.13,345.90,10
1990,0.45,354.35,20
1995,0.45,360.80,30
2000,0.42,369.40,40
2005,0.68,378.80,52
2010,0.72,389.90,65
2015,0.90,400.80,82
2020,1.02,412.50,95
EOF

# Create research notes
cat << EOF > research-data/research_notes.txt
Climate Research Project
=======================

Key Questions:
1. How has global temperature changed over the past 40 years?
2. What is the correlation between CO2 levels and temperature?
3. What are recent trends in sea level rise?
4. What policy implications arise from this data?

Next steps: Need to gather more recent data and prepare visualization.
EOF
```

## Step 4: Create a SQLite Database for Research Data

Let's prepare a query to set up a database that Gordon can interact with:

```bash
docker ai "Create a SQLite database script that will create a climate_research database with a table for the data in research-data/climate_data.csv. Save this script to research-data/setup_database.sql"
```

Now execute the script to create the SQLite database:

```bash
docker ai "Use the SQLite MCP server to execute the setup_database.sql script and create the database. Then confirm the data was loaded correctly by querying and showing the first few rows."
```

## Step 5: Perform Research Tasks

Now let's put our research assistant to work with some complex tasks:

### Task 1: Data Analysis

```bash
docker ai "Analyze the climate data in our SQLite database. Calculate the average temperature increase per decade, the correlation between CO2 and temperature, and the average rate of sea level rise. Create a summary with your findings and save it to output/climate_analysis.md."
```

### Task 2: Web Research Integration

```bash
docker ai "Look up the latest IPCC report summary on climate change online. Compare their findings with our data analysis. Are our trends consistent with their reports? Create a comparison document in output/ipcc_comparison.md."
```

### Task 3: Research Query

```bash
docker ai "Based on our climate data and the IPCC reports, what are the projected sea level rises by 2050 if current trends continue? Create a brief report with your analysis and save it to output/sea_level_projection.md."
```

## Step 6: Research Collaboration (Optional GitHub Integration)

If you have a GitHub account, you can add GitHub integration to your research assistant:

```yaml
services:
  # Previous services...
  
  github:
    image: mcp/github
    environment:
      - GITHUB_TOKEN=your_personal_access_token  # Replace with your PAT
```

Now you can ask Gordon to help with GitHub tasks:

```bash
docker ai "Create a new GitHub repository called climate-research, add all our research output files to it, and commit them with appropriate commit messages."
```

## Understanding the Architecture

Your research assistant is powered by several MCP servers working together:

1. **Filesystem MCP**: Provides secure access to your research data and output directories
2. **SQLite MCP**: Enables database operations for structured data analysis
3. **Fetch MCP**: Allows the assistant to gather additional information from the web
4. **Time MCP**: Provides temporal context for your research
5. **GitHub MCP** (optional): Enables collaboration and version control

This architecture demonstrates how Docker containers provide both the flexibility and security required for AI assistants that need to interact with multiple systems.

## Advanced Research Workflows

Try these additional research assistant tasks:

1. **Literature Review**: Ask Gordon to search for recent climate research papers and summarize their findings
2. **Data Visualization**: Request code to visualize the climate data trends
3. **Policy Analysis**: Ask for policy recommendations based on the research findings

## Troubleshooting

- If SQLite operations fail, check the database path and permissions
- For web fetch issues, ensure your internet connection is working
- If GitHub integration isn't working, verify your personal access token has the correct permissions

## Next Steps

Congratulations on building your research assistant! Continue to:

- [Lab 3: Database Operations with MCP Servers](/docs/labs/database-operations-lab)
- [Tutorial: Building Custom MCP Servers](/docs/tutorials/custom-mcp-server)
