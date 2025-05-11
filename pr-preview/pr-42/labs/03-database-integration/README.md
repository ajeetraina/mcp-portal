# Lab 3: Integrating MCP with Database Systems

This lab demonstrates how to connect Claude to database systems using MCP, enabling AI to query, analyze, and interact with structured data.

## Prerequisites

- Completion of Labs 1 and 2
- Docker and Docker Compose installed
- Basic SQL knowledge
- Understanding of database concepts

## Introduction

Many real-world AI applications need to access and manipulate data stored in databases. This lab shows how to use MCP to give Claude the ability to interact with a PostgreSQL database.

## Step 1: Setting Up the Database Environment

Create a new project directory:

```bash
mkdir mcp-database-lab
cd mcp-database-lab
```

Create a `docker-compose.yml` file that includes PostgreSQL:

```yaml
version: '3'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_PASSWORD: mysecretpassword
      POSTGRES_USER: postgres
      POSTGRES_DB: customersdb
    ports:
      - "5432:5432"
    volumes:
      - ./init-db:/docker-entrypoint-initdb.d
      - postgres-data:/var/lib/postgresql/data
  
  mcp-postgres:
    image: mcp/postgres
    depends_on:
      - postgres
    environment:
      - PG_CONNECTION_STRING=postgres://postgres:mysecretpassword@postgres:5432/customersdb
  
  mcp-proxy:
    image: anthropic/mcp-proxy:latest
    ports:
      - "8080:8080"
    environment:
      - MCP_API_KEY=${MCP_API_KEY}
      - CLAUDE_API_KEY=${CLAUDE_API_KEY}
    volumes:
      - ./config:/app/config
    depends_on:
      - mcp-postgres

volumes:
  postgres-data:
```

## Step 2: Setting Up Sample Data

Create the initialization directory and script:

```bash
mkdir -p init-db
```

Create an `init-db/01-init.sql` file with sample data:

```sql
-- Create tables
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    signup_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active'
);

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id),
    order_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending'
);

CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    inventory INTEGER DEFAULT 0
);

CREATE TABLE order_items (
    order_id INTEGER REFERENCES orders(order_id),
    product_id INTEGER REFERENCES products(product_id),
    quantity INTEGER NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (order_id, product_id)
);

-- Insert sample data
INSERT INTO customers (name, email, signup_date, status) VALUES
('John Doe', 'john@example.com', '2023-01-15', 'active'),
('Jane Smith', 'jane@example.com', '2023-02-20', 'active'),
('Alice Johnson', 'alice@example.com', '2023-03-10', 'inactive'),
('Bob Williams', 'bob@example.com', '2023-04-05', 'active'),
('Charlie Brown', 'charlie@example.com', '2023-05-12', 'active');

INSERT INTO products (name, description, price, category, inventory) VALUES
('Laptop Pro', 'High-performance laptop for professionals', 1299.99, 'Electronics', 50),
('Smartphone X', 'Latest smartphone with advanced features', 899.99, 'Electronics', 100),
('Wireless Earbuds', 'Premium sound quality wireless earbuds', 149.99, 'Audio', 200),
('Designer Watch', 'Luxury watch with premium build quality', 499.99, 'Accessories', 30),
('Smart Home Hub', 'Control your home with voice commands', 199.99, 'Smart Home', 75);

INSERT INTO orders (customer_id, order_date, total_amount, status) VALUES
(1, '2023-06-01', 1449.98, 'completed'),
(2, '2023-06-15', 899.99, 'shipped'),
(3, '2023-07-02', 149.99, 'cancelled'),
(4, '2023-07-20', 699.98, 'completed'),
(1, '2023-08-05', 199.99, 'pending');

INSERT INTO order_items (order_id, product_id, quantity, price_per_unit) VALUES
(1, 1, 1, 1299.99),
(1, 3, 1, 149.99),
(2, 2, 1, 899.99),
(3, 3, 1, 149.99),
(4, 4, 1, 499.99),
(4, 3, 1, 199.99),
(5, 5, 1, 199.99);
```

## Step 3: Creating the MCP Tool Configuration

Create a directory for your config:

```bash
mkdir config
```

Create a `config/tools.json` file:

```json
{
  "tools": [
    {
      "name": "postgres",
      "service": "mcp-postgres:5432",
      "description": "Executes SQL queries on a PostgreSQL database with customer, order, and product information",
      "schema": {
        "type": "function",
        "function": {
          "name": "query",
          "description": "Execute a SQL query on the PostgreSQL database",
          "parameters": {
            "type": "object",
            "properties": {
              "sql": {
                "type": "string",
                "description": "The SQL query to execute. Supports SELECT, but not data modification."
              }
            },
            "required": ["sql"]
          }
        }
      }
    }
  ]
}
```

## Step 4: Running the Environment

Start all the services:

```bash
export MCP_API_KEY=your_mcp_api_key
export CLAUDE_API_KEY=your_claude_api_key
docker-compose up -d
```

Give the database a moment to initialize:

```bash
sleep 10
```

## Step 5: Testing Database Interactions

Create a file called `test_database.py`:

```python
import requests
import json

API_KEY = "your_claude_api_key"
MCP_URL = "http://localhost:8080/v1/messages"

headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

conversation = {
    "model": "claude-3-opus-20240229",
    "messages": [
        {"role": "user", "content": "What are the top 3 customers by total spending? Show their names and total amounts."}
    ],
    "tools": [
        {
            "name": "postgres",
            "description": "Executes SQL queries on a PostgreSQL database with customer, order, and product information"
        }
    ]
}

response = requests.post(MCP_URL, headers=headers, json=conversation)
result = response.json()
print(json.dumps(result, indent=2))
```

Run the script:

```bash
python test_database.py
```

## Step 6: Advanced Database Interactions

Now, try more complex analytical queries that demonstrate the power of combining AI with databases:

```python
# Update your conversation dictionary with one of these prompts

# For customer segmentation:
conversation["messages"] = [
    {"role": "user", "content": "Can you segment our customers based on their spending habits? Create a table showing customer groups like 'high spenders' (>$1000), 'medium spenders' ($500-$1000), and 'low spenders' (<$500)."}
]

# For product performance analysis:
conversation["messages"] = [
    {"role": "user", "content": "Which product categories are most popular? Create a report showing the number of orders and total revenue by category."}
]

# For trend identification:
conversation["messages"] = [
    {"role": "user", "content": "Can you identify any buying patterns or trends in our order data? Look at metrics like order frequency, average order value, and popular product combinations."}
]
```

## Next Steps

- Create views or stored procedures to simplify complex queries
- Add write capabilities to the database connection (with proper security)
- Combine the database tool with other MCP tools for more complex workflows
- Explore connecting to other database systems like MongoDB or MySQL

## Troubleshooting

- If the database connection fails, check that the PostgreSQL container is running
- Verify the connection string parameters in the docker-compose file
- Look for SQL syntax errors in your queries
