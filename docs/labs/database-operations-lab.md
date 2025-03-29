---
layout: page
title: Lab 3 - Database Operations with MCP Servers
---

# Lab 3: Database Operations with MCP Servers

In this intermediate-level lab, you'll learn how to use Docker MCP servers to interact with databases and perform various database operations through Gordon AI.

**Time to complete:** 60 minutes

**Prerequisites:**
- Completion of [Lab 1: First Steps with Docker MCP Servers](/docs/labs/mcp-101-lab)
- Docker Desktop installed
- Basic SQL knowledge

## Learning Objectives

By the end of this lab, you'll be able to:
1. Configure MCP servers to work with both SQLite and PostgreSQL databases
2. Perform complex database operations via natural language requests
3. Understand the security implications of database access via MCP
4. Create data analysis workflows combining multiple MCP servers

## Step 1: Setting Up Your Environment

Create a new directory for your database lab:

```bash
mkdir mcp-db-lab
cd mcp-db-lab
mkdir data
```

## Step 2: Create a Sample SQLite Database

First, let's create a SQL script to initialize our database:

```bash
cat << EOF > data/init.sql
CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    salary REAL NOT NULL,
    hire_date TEXT NOT NULL
);

INSERT INTO employees (name, department, salary, hire_date) VALUES
('John Doe', 'Engineering', 85000, '2020-03-15'),
('Jane Smith', 'Marketing', 75000, '2019-11-01'),
('Bob Johnson', 'Engineering', 92000, '2018-05-20'),
('Alice Williams', 'HR', 65000, '2021-01-10'),
('Charlie Brown', 'Marketing', 78000, '2020-09-05'),
('David Miller', 'Engineering', 115000, '2015-07-12'),
('Emily Davis', 'Finance', 95000, '2017-04-22'),
('Frank Wilson', 'HR', 68000, '2019-08-30'),
('Grace Lee', 'Engineering', 105000, '2016-11-15'),
('Henry Taylor', 'Finance', 88000, '2018-06-03');

CREATE TABLE departments (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    budget REAL NOT NULL,
    location TEXT NOT NULL
);

INSERT INTO departments (name, budget, location) VALUES
('Engineering', 1500000, 'Building A'),
('Marketing', 800000, 'Building B'),
('HR', 400000, 'Building A'),
('Finance', 950000, 'Building C');

CREATE TABLE projects (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    department_id INTEGER,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

INSERT INTO projects (name, start_date, end_date, department_id) VALUES
('Website Redesign', '2023-01-15', '2023-06-30', 2),
('Cloud Migration', '2023-02-01', NULL, 1),
('Budget Analysis', '2023-03-10', '2023-04-15', 4),
('Hiring Campaign', '2023-02-20', '2023-05-10', 3),
('Mobile App', '2022-11-01', NULL, 1);

CREATE TABLE employee_projects (
    employee_id INTEGER,
    project_id INTEGER,
    role TEXT NOT NULL,
    PRIMARY KEY (employee_id, project_id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

INSERT INTO employee_projects (employee_id, project_id, role) VALUES
(1, 2, 'Developer'),
(1, 5, 'Lead Developer'),
(2, 1, 'Project Manager'),
(3, 2, 'DevOps Engineer'),
(3, 5, 'Developer'),
(4, 4, 'Coordinator'),
(5, 1, 'Content Creator'),
(6, 2, 'Architect'),
(7, 3, 'Analyst'),
(8, 4, 'Recruiter'),
(9, 5, 'Developer'),
(10, 3, 'Supervisor');
EOF
```

## Step 3: Configure MCP Servers for Database Operations

Create a `gordon-mcp.yml` file with SQLite MCP server configuration:

```yaml
services:
  sqlite:
    image: mcp/sqlite
    volumes:
      - ./data:/data
  
  fs:
    image: mcp/filesystem
    command:
      - /rootfs
    volumes:
      - ./data:/rootfs/data
      - ./:/rootfs/output
```

This configuration sets up two MCP servers:
- A SQLite server that can interact with SQLite databases
- A filesystem server that gives access to our data directory

## Step 4: Basic SQLite Database Operations

Let's start with some basic SQLite operations:

```bash
# Initialize the database
docker ai "Create a new SQLite database called 'company.db' in the data directory and run the SQL commands from the init.sql file to set it up."
```

You should see Gordon AI using the SQLite MCP server to create the database. Now let's try some queries:

```bash
# Basic query
docker ai "Query the company database and list all employees in the Engineering department with their salaries."
```

You should see a list of employees in the Engineering department. Let's try a more complex query:

```bash
# More complex query
docker ai "Find the average salary by department and identify which department has the highest average salary. Format the results as a markdown table."
```

**Tip:** You can ask Gordon AI to format results in various ways, such as tables, lists, or even generate visualizations with descriptions.

## Step 5: Set Up PostgreSQL for Advanced Operations

For more advanced database operations, let's add PostgreSQL to our environment. First, we'll start a PostgreSQL container with our sample data:

```bash
# Start a PostgreSQL container
docker run -d \
  --name postgres-mcp-lab \
  -e POSTGRES_PASSWORD=labpassword \
  -e POSTGRES_USER=labuser \
  -e POSTGRES_DB=company \
  -p 5432:5432 \
  postgres:14
```

Now, update your `gordon-mcp.yml` file to include the PostgreSQL MCP server:

```yaml
services:
  sqlite:
    image: mcp/sqlite
    volumes:
      - ./data:/data
  
  fs:
    image: mcp/filesystem
    command:
      - /rootfs
    volumes:
      - ./data:/rootfs/data
      - ./:/rootfs/output
  
  postgres:
    image: mcp/postgres
    command: postgresql://labuser:labpassword@host.docker.internal:5432/company
```

Initialize our PostgreSQL database with the same schema:

```bash
docker ai "Connect to the PostgreSQL database and create the same schema as in our SQLite database. Use the init.sql file as reference. Then confirm the tables were created correctly."
```

## Step 6: Advanced Database Operations

Now let's perform more complex database tasks:

### Task 1: Cross-Database Analysis

```bash
docker ai "Compare the schema between our SQLite database and PostgreSQL database. Are there any differences? Which database would you recommend for our company data and why?"
```

### Task 2: Data Analysis and Reporting

```bash
docker ai "Analyze the employee and project data in the PostgreSQL database. Which employees are working on multiple projects? Create a report showing the workload distribution across departments. Save the report as a markdown file called workload_analysis.md."
```

### Task 3: Database Schema Improvements

```bash
docker ai "Suggest improvements to our database schema. What indexes, constraints, or additional tables would you recommend? Create a SQL script with your recommendations and save it to output/schema_improvements.sql."
```

**Understanding MCP Database Operations:**  
When you ask Gordon AI to perform database operations:
1. Gordon identifies the task requires database interaction
2. It selects the appropriate MCP server (SQLite or PostgreSQL)
3. The MCP server translates natural language into SQL queries
4. Results are returned and formatted according to your request

This powerful abstraction allows non-technical users to interact with databases using natural language.

## Step 7: Building a Database Dashboard

For a more advanced exercise, let's create a simple dashboard for our data:

```bash
docker ai "Create an HTML dashboard that shows key metrics from our company database, including department budgets, employee salary distributions, and project statuses. Use JavaScript for any interactive elements. Save the dashboard to output/company_dashboard.html."
```

Once the dashboard is created, you can open it in your browser:

```bash
# On macOS
open output/company_dashboard.html

# On Linux
xdg-open output/company_dashboard.html

# On Windows
start output/company_dashboard.html
```

## Step 8: Database Security Considerations

It's important to understand the security implications of using MCP servers with databases. Here are some best practices:

1. **Connection Strings**: Never expose database credentials in public repositories
2. **Access Control**: Use read-only connections when only queries are needed
3. **Container Networks**: Consider using Docker networks to isolate database containers
4. **Volume Mounting**: Be careful about what directories you mount to containers

Let's implement a more secure configuration by creating a Docker network and updating our setup:

```bash
# Create a Docker network
docker network create mcp-db-network

# Stop and remove the existing PostgreSQL container
docker stop postgres-mcp-lab
docker rm postgres-mcp-lab

# Start PostgreSQL with the new network
docker run -d \
  --name postgres-mcp-lab \
  --network mcp-db-network \
  -e POSTGRES_PASSWORD=labpassword \
  -e POSTGRES_USER=labuser \
  -e POSTGRES_DB=company \
  postgres:14
```

Create a new `secure-gordon-mcp.yml` file:

```yaml
services:
  sqlite:
    image: mcp/sqlite
    volumes:
      - ./data:/data:ro  # Read-only access
  
  fs:
    image: mcp/filesystem
    command:
      - /rootfs
    volumes:
      - ./data:/rootfs/data:ro  # Read-only access to data
      - ./output:/rootfs/output:rw  # Write access only to output
  
  postgres:
    image: mcp/postgres
    command: postgresql://labuser:labpassword@postgres-mcp-lab:5432/company
    networks:
      - mcp-db-network

networks:
  mcp-db-network:
    external: true
    name: mcp-db-network
```

Let's test our secure configuration:

```bash
docker ai --file secure-gordon-mcp.yml "Query the PostgreSQL database to find the highest paid employee in each department."
```

## Advanced Database Tips

- **Performance Optimization**: Ask Gordon AI to generate database indexes for better performance
- **Data Migration**: Use MCP servers to help migrate data between different database systems
- **Query Generation**: Have Gordon AI generate complex queries that you can reuse in your applications
- **Documentation**: Ask for database documentation to be generated automatically

## Troubleshooting

- If PostgreSQL connections fail, ensure the host.docker.internal resolution is working
- For SQLite issues, check file permissions on the data directory
- If queries return unexpected results, verify the database schema and data

## Next Steps

Now that you've mastered database operations with MCP, you can continue your learning journey with:

- [Lab 4: Deploying MCP Servers to Production](/docs/labs/production-deployment-lab) - Learn how to deploy your MCP servers in a production environment
- [Tutorial: Building Custom MCP Servers](/docs/tutorials/custom-mcp-server) - Create your own specialized MCP servers