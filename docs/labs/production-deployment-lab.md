---
layout: page
title: Lab 4 - Deploying MCP Servers to Production
---

# Lab 4: Deploying MCP Servers to Production

In this advanced lab, you'll learn how to deploy Docker MCP servers to a production environment with proper security, monitoring, and scaling considerations. You'll set up a robust infrastructure that can be used in real-world enterprise settings.

**Time to complete:** 90 minutes

**Prerequisites:**
- Completion of previous MCP labs
- Intermediate Docker and Docker Compose knowledge
- Basic understanding of networking and security concepts
- A cloud account (AWS, GCP, or Azure) or a server for deployment

## Learning Objectives

By the end of this lab, you'll be able to:
1. Set up secure MCP server deployments for production use
2. Implement monitoring and logging for MCP servers
3. Scale MCP servers to handle production loads
4. Manage secrets and configuration securely
5. Implement proper access controls for MCP servers

## Step 1: Preparing Your Production Environment

Create a new directory for your production deployment:

```bash
mkdir mcp-production
cd mcp-production
```

Create a `.env` file to store sensitive configuration (this should never be committed to a repository):

```
# API Keys and Secrets
GITHUB_TOKEN=your_github_token_here
DATABASE_PASSWORD=your_secure_db_password

# Configuration
MCP_LOG_LEVEL=info
MONITORING_ENABLED=true
```

## Step 2: Creating a Secure Production Compose File

Create a `docker-compose.yml` file with the following content:

```yaml
version: '3.8'

services:
  # MCP Servers
  time:
    image: mcp/time:latest
    restart: unless-stopped
    networks:
      - mcp-internal
    logging: &logging
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
    deploy:
      resources:
        limits:
          cpus: '0.25'
          memory: 256M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/.well-known/mcp"]
      interval: 30s
      timeout: 10s
      retries: 3

  fetch:
    image: mcp/fetch:latest
    restart: unless-stopped
    networks:
      - mcp-internal
      - mcp-external
    logging: *logging
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/.well-known/mcp"]
      interval: 30s
      timeout: 10s
      retries: 3

  fs:
    image: mcp/filesystem:latest
    command:
      - /rootfs
    volumes:
      - ./data:/rootfs/data:ro
      - ./output:/rootfs/output:rw
    restart: unless-stopped
    networks:
      - mcp-internal
    logging: *logging
    deploy:
      resources:
        limits:
          cpus: '0.25'
          memory: 256M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/.well-known/mcp"]
      interval: 30s
      timeout: 10s
      retries: 3

  github:
    image: mcp/github:latest
    restart: unless-stopped
    networks:
      - mcp-internal
      - mcp-external
    environment:
      - GITHUB_TOKEN=${GITHUB_TOKEN}
    logging: *logging
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/.well-known/mcp"]
      interval: 30s
      timeout: 10s
      retries: 3

  # PostgreSQL MCP Server with separate database
  postgres-mcp:
    image: mcp/postgres:latest
    command: postgresql://mcpuser:${DATABASE_PASSWORD}@postgres-db:5432/mcpdb
    restart: unless-stopped
    networks:
      - mcp-internal
      - db-network
    depends_on:
      - postgres-db
    logging: *logging
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/.well-known/mcp"]
      interval: 30s
      timeout: 10s
      retries: 3

  # MCP Gateway - Single entry point for AI assistants
  mcp-gateway:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
    networks:
      - mcp-internal
      - mcp-public
    depends_on:
      - time
      - fetch
      - fs
      - github
      - postgres-mcp
    logging: *logging
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M

  # Supporting services
  postgres-db:
    image: postgres:14-alpine
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=mcpuser
      - POSTGRES_PASSWORD=${DATABASE_PASSWORD}
      - POSTGRES_DB=mcpdb
    networks:
      - db-network
    restart: unless-stopped
    logging: *logging
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "mcpuser"]
      interval: 30s
      timeout: 5s
      retries: 3

  # Monitoring
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus:/etc/prometheus
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    networks:
      - monitoring
      - mcp-internal
    restart: unless-stopped
    logging: *logging
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  grafana:
    image: grafana/grafana:latest
    volumes:
      - ./grafana:/etc/grafana/provisioning
      - grafana-data:/var/lib/grafana
    ports:
      - "3000:3000"
    networks:
      - monitoring
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD:-admin}
    restart: unless-stopped
    logging: *logging
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

networks:
  mcp-internal:
    internal: true
  mcp-external:
    internal: false
  mcp-public:
    internal: false
  db-network:
    internal: true
  monitoring:
    internal: true

volumes:
  postgres-data:
  prometheus-data:
  grafana-data:
```

## Step 3: Configuring the NGINX Gateway

Create the NGINX configuration files that will serve as a gateway to your MCP servers:

```bash
mkdir -p nginx/conf.d
```

Create `nginx/nginx.conf`:

```nginx
user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log notice;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    keepalive_timeout  65;

    #gzip  on;

    include /etc/nginx/conf.d/*.conf;
}
```

Create `nginx/conf.d/default.conf`:

```nginx
server {
    listen 80;
    server_name localhost;

    # Authentication for MCP access
    auth_basic "MCP Server Access";
    auth_basic_user_file /etc/nginx/.htpasswd;

    # Time MCP server
    location /time/ {
        proxy_pass http://time:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Fetch MCP server
    location /fetch/ {
        proxy_pass http://fetch:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Filesystem MCP server
    location /fs/ {
        proxy_pass http://fs:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # GitHub MCP server
    location /github/ {
        proxy_pass http://github:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # PostgreSQL MCP server
    location /postgres/ {
        proxy_pass http://postgres-mcp:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Health check endpoint (no auth required)
    location = /health {
        auth_basic off;
        return 200 '{"status":"healthy","timestamp":"$time_iso8601"}';
        default_type application/json;
    }
}
```

Create a password file for basic authentication:

```bash
docker run --rm -it httpd:alpine htpasswd -bn mcp your_secure_password > nginx/.htpasswd
```

## Step 4: Setting Up Monitoring

Create Prometheus configuration:

```bash
mkdir -p prometheus
```

Create `prometheus/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'mcp-services'
    metrics_path: /metrics
    static_configs:
      - targets: ['time:8080', 'fetch:8080', 'fs:8080', 'github:8080', 'postgres-mcp:8080']
```

Set up Grafana dashboards by creating directories and configuration files:

```bash
mkdir -p grafana/dashboards grafana/datasources
```

Create `grafana/datasources/prometheus.yml`:

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
```

## Step 5: Deploying Your Production Environment

Now that your configuration is ready, deploy the stack:

```bash
docker compose up -d
```

Verify that all services are running:

```bash
docker compose ps
```

Check the logs for any issues:

```bash
docker compose logs
```

## Step 6: Testing Your Production Deployment

Test the health endpoint to ensure your gateway is working:

```bash
curl http://localhost:8080/health
```

Test authentication:

```bash
curl -u mcp:your_secure_password http://localhost:8080/time/.well-known/mcp
```

## Step 7: Configuring Gordon AI to Use Your Production MCP Server

Now you need to create a configuration that tells Gordon AI to use your production MCP servers. Create a `gordon-mcp.yml` file in your project directory:

```yaml
services:
  production-mcp-gateway:
    image: curlimages/curl
    command: |
      -s -X GET -f 
      -u mcp:your_secure_password 
      http://your-server-address:8080/time/.well-known/mcp
    labels:
      mcp.base-url: http://your-server-address:8080/time/
      mcp.auth: Basic bWNwOnlvdXJfc2VjdXJlX3Bhc3N3b3Jk  # Base64 encoded mcp:your_secure_password

  production-mcp-fs:
    image: curlimages/curl
    command: |
      -s -X GET -f 
      -u mcp:your_secure_password 
      http://your-server-address:8080/fs/.well-known/mcp
    labels:
      mcp.base-url: http://your-server-address:8080/fs/
      mcp.auth: Basic bWNwOnlvdXJfc2VjdXJlX3Bhc3N3b3Jk  # Base64 encoded mcp:your_secure_password

  production-mcp-github:
    image: curlimages/curl
    command: |
      -s -X GET -f 
      -u mcp:your_secure_password 
      http://your-server-address:8080/github/.well-known/mcp
    labels:
      mcp.base-url: http://your-server-address:8080/github/
      mcp.auth: Basic bWNwOnlvdXJfc2VjdXJlX3Bhc3N3b3Jk  # Base64 encoded mcp:your_secure_password
```

Replace `your-server-address` with the actual address of your server. The Base64 encoded auth string is the base64 encoding of `mcp:your_secure_password`.

## Step 8: Load Testing and Scaling

To ensure your production deployment can handle real-world load, perform load testing:

1. Install a load testing tool like `hey`:

```bash
# For macOS
brew install hey

# For Linux
go install github.com/rakyll/hey@latest
```

2. Run a basic load test against your MCP server:

```bash
hey -n 1000 -c 50 -H "Authorization: Basic bWNwOnlvdXJfc2VjdXJlX3Bhc3N3b3Jk" http://your-server-address:8080/time/.well-known/mcp
```

3. Based on the results, you may need to scale your services horizontally. Update your Docker Compose file to include replica settings:

```yaml
services:
  time:
    deploy:
      mode: replicated
      replicas: 3
      resources:
        limits:
          cpus: '0.25'
          memory: 256M
```

## Step 9: Implementing Security Best Practices

To ensure your production MCP servers are secure, implement these additional security measures:

### Add TLS/SSL

Update your NGINX configuration to use HTTPS:

1. Generate a self-signed certificate or obtain a real one:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx/ssl/private.key -out nginx/ssl/certificate.crt
```

2. Update the NGINX configuration in `nginx/conf.d/default.conf` to include SSL:

```nginx
server {
    listen 80;
    server_name your-server-address;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-server-address;

    ssl_certificate /etc/nginx/ssl/certificate.crt;
    ssl_certificate_key /etc/nginx/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Rest of your configuration...
}
```

### Implement Rate Limiting

Add rate limiting to your NGINX configuration to prevent abuse:

```nginx
http {
    # Rate limiting settings
    limit_req_zone $binary_remote_addr zone=mcp_limit:10m rate=10r/s;

    server {
        # Apply rate limiting to MCP endpoints
        location ~ ^/(time|fetch|fs|github|postgres)/ {
            limit_req zone=mcp_limit burst=20 nodelay;
            # Rest of your proxy configuration...
        }
    }
}
```

### Regular Security Audits

Create a script to regularly audit your deployment for security issues:

```bash
cat > security-audit.sh << 'EOF'
#!/bin/bash

echo "=== MCP Security Audit $(date) ==="

# Check for outdated images
echo "\nChecking for outdated images..."
docker compose images

# Check container security with Docker Bench for Security
echo "\nRunning Docker security scan..."
docker run --rm -it \
  --net host \
  --pid host \
  --userns host \
  --cap-add audit_control \
  -v /var/lib:/var/lib \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /usr/lib/systemd:/usr/lib/systemd \
  -v /etc:/etc \
  docker/docker-bench-security

# Check exposed ports
echo "\nChecking exposed ports..."
ss -tulpn | grep LISTEN

# Check for failed login attempts
echo "\nChecking for failed login attempts..."
grep "Failed password" /var/log/auth.log | tail -10

echo "\n=== Audit Complete ==="
EOF

chmod +x security-audit.sh
```

## Step 10: Maintaining and Updating Your Deployment

Create a script to simplify updating your MCP servers:

```bash
cat > update-mcp-servers.sh << 'EOF'
#!/bin/bash

echo "=== Updating MCP Servers $(date) ==="

# Pull the latest images
echo "\nPulling latest images..."
docker compose pull

# Backup configuration
echo "\nBacking up configuration..."
mkdir -p backups/$(date +%Y-%m-%d)
cp docker-compose.yml backups/$(date +%Y-%m-%d)/
cp .env backups/$(date +%Y-%m-%d)/
cp -r nginx backups/$(date +%Y-%m-%d)/

# Restart services with new images
echo "\nRestarting services..."
docker compose down --remove-orphans
docker compose up -d

# Verify all services are running
echo "\nVerifying services..."
docker compose ps

# Test health endpoint
echo "\nTesting health endpoint..."
curl -s http://localhost:8080/health

echo "\n=== Update Complete ==="
EOF

chmod +x update-mcp-servers.sh
```

## Implementing a Backup Strategy

Add a backup strategy for your MCP server data:

```bash
cat > backup-mcp-data.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/path/to/backup/location"
TIMESTAMP=$(date +%Y-%m-%d-%H%M)

# Create backup directory
mkdir -p "$BACKUP_DIR/$TIMESTAMP"

# Backup PostgreSQL database
echo "Backing up PostgreSQL database..."
docker compose exec postgres-db pg_dump -U mcpuser mcpdb > "$BACKUP_DIR/$TIMESTAMP/mcpdb.sql"

# Backup configuration files
echo "Backing up configuration files..."
cp -r .env docker-compose.yml nginx prometheus grafana "$BACKUP_DIR/$TIMESTAMP/"

# Backup filesystem data
echo "Backing up filesystem data..."
tar -czf "$BACKUP_DIR/$TIMESTAMP/data.tar.gz" data output

# Set proper permissions
chmod -R 600 "$BACKUP_DIR/$TIMESTAMP"

# Cleanup old backups (keep last 7 days)
find "$BACKUP_DIR" -maxdepth 1 -type d -mtime +7 -exec rm -rf {} \;

echo "Backup completed: $BACKUP_DIR/$TIMESTAMP"
EOF

chmod +x backup-mcp-data.sh
```

## Conclusion

Congratulations! You've successfully deployed a production-ready Docker MCP server environment with:

- **Security**: Authentication, network isolation, and secure secret management
- **Monitoring**: Prometheus and Grafana integration for observability
- **High Availability**: Health checks and automatic restarts
- **Performance**: Resource constraints and scaling options
- **Maintainability**: Update and backup scripts

This deployment provides a robust foundation for using Docker MCP servers in real-world enterprise environments. The Gateway pattern allows you to add new MCP servers without changing client configurations, while the security measures ensure that only authorized clients can access your MCP servers.

## Next Steps

- [Learn about Kubernetes Deployment for MCP Servers](/docs/tutorials/mcp-kubernetes)
- [MCP Server Administration Guide](/docs/admin/mcp-admin-guide)
- [Integrating with CI/CD Pipelines](/docs/tutorials/mcp-cicd-integration)

## Troubleshooting

- If your NGINX gateway isn't routing requests properly, check the network configuration
- For authentication issues, verify your Base64 encoded credentials
- If MCP servers aren't starting, check your Docker logs and resource constraints
- For monitoring issues, ensure Prometheus can reach all your MCP servers
