---
layout: page
title: Tutorial: Building Custom MCP Servers
---

# Tutorial: Building Custom MCP Servers

In this advanced tutorial, you'll learn how to create your own custom Model Context Protocol (MCP) server and package it as a Docker container. This will allow you to extend AI assistants like Gordon with capabilities tailored to your specific needs.

**Time to complete:** 90-120 minutes

**Prerequisites:**
- Solid understanding of Docker and containerization
- Experience with Python programming
- Familiarity with API development
- Completion of previous MCP labs (recommended)

## Learning Objectives

By the end of this tutorial, you'll be able to:
1. Understand the MCP server architecture and protocol
2. Implement a custom MCP server in Python
3. Package your MCP server as a Docker container
4. Test and debug your MCP server with Gordon AI
5. Deploy your MCP server for production use

## Understanding MCP Architecture

Before building a custom server, it's important to understand how MCP works:

1. **MCP Protocol**: A standardized way for AI assistants to interact with external systems
2. **MCP Servers**: Services that implement the protocol to provide specific capabilities
3. **Discovery**: AI assistants discover available MCP servers through configuration
4. **Interaction Flow**: 
   - AI identifies a need for external context
   - AI sends a request to the appropriate MCP server
   - MCP server processes the request and returns contextual information
   - AI incorporates this context into its response

## Step 1: Setting Up Your Development Environment

Create a directory for your custom MCP server project:

```bash
mkdir custom-mcp-server
cd custom-mcp-server
```

Create a virtual environment for Python development:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Install the required packages:

```bash
pip install fastapi uvicorn pydantic mcp
```

## Step 2: Creating a Simple Weather MCP Server

Let's create a simple MCP server that provides weather information. We'll use a free weather API for this example.

First, create a basic project structure:

```bash
mkdir -p weather_mcp/app
touch weather_mcp/app/__init__.py
touch weather_mcp/app/main.py
touch weather_mcp/Dockerfile
touch weather_mcp/requirements.txt
```

Add the following to `weather_mcp/requirements.txt`:

```
fastapi>=0.103.1
uvicorn>=0.23.2
pydantic>=2.4.2
httpx>=0.25.0
python-dotenv>=1.0.0
```

Now, let's implement our main application in `weather_mcp/app/main.py`:

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import httpx
import os
from typing import Dict, Any, List, Optional
from datetime import datetime

app = FastAPI(title="Weather MCP Server")

# Typically you'd use environment variables for API keys
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "your_demo_api_key")
WEATHER_API_URL = "https://api.weatherapi.com/v1"

# MCP Models
class MCPSpecification(BaseModel):
    name: str
    description: str
    parameters: Dict[str, Any]

class MCPFunction(BaseModel):
    name: str
    description: str
    parameters: Dict[str, Any] = Field(default_factory=dict)

class MCPFunctionResponse(BaseModel):
    content: Any

# Weather Models
class WeatherRequest(BaseModel):
    location: str
    units: Optional[str] = "metric"  # metric or imperial

class ForecastRequest(BaseModel):
    location: str
    days: int = Field(ge=1, le=10)
    units: Optional[str] = "metric"

# MCP Discovery endpoint
@app.get("/.well-known/mcp")
async def get_mcp_specification() -> MCPSpecification:
    return MCPSpecification(
        name="weather",
        description="MCP server providing weather information for locations worldwide",
        parameters={
            "functions": [
                {
                    "name": "get_current_weather",
                    "description": "Get current weather conditions for a location",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "location": {
                                "type": "string",
                                "description": "City name, ZIP code, or latitude/longitude"
                            },
                            "units": {
                                "type": "string",
                                "enum": ["metric", "imperial"],
                                "description": "Units system to use for temperature and measurements"
                            }
                        },
                        "required": ["location"]
                    }
                },
                {
                    "name": "get_weather_forecast",
                    "description": "Get weather forecast for a location",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "location": {
                                "type": "string",
                                "description": "City name, ZIP code, or latitude/longitude"
                            },
                            "days": {
                                "type": "integer",
                                "minimum": 1,
                                "maximum": 10,
                                "description": "Number of days to forecast (1-10)"
                            },
                            "units": {
                                "type": "string",
                                "enum": ["metric", "imperial"],
                                "description": "Units system to use for temperature and measurements"
                            }
                        },
                        "required": ["location", "days"]
                    }
                }
            ]
        }
    )

# Weather API endpoints
@app.post("/mcp/get_current_weather")
async def current_weather(request: WeatherRequest) -> MCPFunctionResponse:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{WEATHER_API_URL}/current.json",
                params={
                    "key": WEATHER_API_KEY,
                    "q": request.location,
                    "aqi": "no"
                }
            )
            response.raise_for_status()
            data = response.json()
            
            # Process based on units requested
            temp_key = "temp_c" if request.units == "metric" else "temp_f"
            wind_key = "wind_kph" if request.units == "metric" else "wind_mph"
            precip_key = "precip_mm" if request.units == "metric" else "precip_in"
            
            weather_data = {
                "location": f"{data['location']['name']}, {data['location']['country']}",
                "temperature": data['current'][temp_key],
                "condition": data['current']['condition']['text'],
                "humidity": data['current']['humidity'],
                "wind_speed": data['current'][wind_key],
                "precipitation": data['current'][precip_key],
                "is_day": data['current']['is_day'] == 1,
                "last_updated": data['current']['last_updated'],
                "units": request.units
            }
            
            return MCPFunctionResponse(content=weather_data)
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail="Weather API error")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/mcp/get_weather_forecast")
async def weather_forecast(request: ForecastRequest) -> MCPFunctionResponse:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{WEATHER_API_URL}/forecast.json",
                params={
                    "key": WEATHER_API_KEY,
                    "q": request.location,
                    "days": request.days,
                    "aqi": "no",
                    "alerts": "no"
                }
            )
            response.raise_for_status()
            data = response.json()
            
            # Extract forecast data based on units
            temp_key = "avgtemp_c" if request.units == "metric" else "avgtemp_f"
            precip_key = "totalprecip_mm" if request.units == "metric" else "totalprecip_in"
            
            forecast_data = {
                "location": f"{data['location']['name']}, {data['location']['country']}",
                "forecast": []
            }
            
            for day in data['forecast']['forecastday'][:request.days]:
                forecast_data['forecast'].append({
                    "date": day['date'],
                    "avg_temp": day['day'][temp_key],
                    "condition": day['day']['condition']['text'],
                    "chance_of_rain": day['day']['daily_chance_of_rain'],
                    "precipitation": day['day'][precip_key],
                    "humidity": day['day']['avghumidity']
                })
            
            return MCPFunctionResponse(content=forecast_data)
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail="Weather API error")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
```

## Step 3: Dockerizing Your MCP Server

Create a Dockerfile in the `weather_mcp` directory:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

Now build your Docker image:

```bash
cd weather_mcp
docker build -t mcp/weather .
```

## Step 4: Testing Your MCP Server

Let's create a test configuration to use with Gordon AI. In a new directory, create a `gordon-mcp.yml` file:

```yaml
services:
  weather:
    image: mcp/weather
    environment:
      - WEATHER_API_KEY=your_real_api_key_here  # Get from weatherapi.com
    ports:
      - "8080:8080"
```

Now test your MCP server with Gordon:

```bash
docker ai "What's the current weather in San Francisco?"
```

Try a more complex query:

```bash
docker ai "Give me a 3-day weather forecast for Tokyo and suggest appropriate clothing for each day."
```

## Step 5: Enhancing Your MCP Server

To make your MCP server more useful, consider these enhancements:

### Error Handling

Improve error handling by adding more detailed error messages and fallbacks for when the external API is unavailable.

### Caching

Add caching to reduce redundant API calls for the same locations within a short time period:

```python
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.decorator import cache
import redis

# Initialize cache in your app startup
@app.on_event("startup")
async def startup():
    redis_client = redis.Redis(host="redis", port=6379, db=0, encoding="utf8")
    FastAPICache.init(RedisBackend(redis_client), prefix="weather_cache:")

# Add caching to your endpoints
@app.post("/mcp/get_current_weather")
@cache(expire=300)  # Cache for 5 minutes
async def current_weather(request: WeatherRequest) -> MCPFunctionResponse:
    # Existing implementation...
```

### Add Health Checks

Implement health checks to ensure your MCP server is operating correctly:

```python
@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
```

## Step 6: Extending to Other Use Cases

Once you've built one MCP server, you can apply the same pattern to other domains:

- **Stock Market Data**: Create an MCP server for fetching financial information
- **Local Services**: Build an MCP server that queries your internal APIs or services
- **IoT Control**: Develop an MCP server to monitor and control IoT devices
- **Custom Analytics**: Make an MCP server that performs specialized data analysis

## Step 7: Production Deployment

When deploying your MCP server to production, consider:

### Security

- Use proper authentication for sensitive operations
- Implement rate limiting to prevent abuse
- Never hardcode API keys; use environment variables or secrets management

### Reliability

- Implement retry logic for transient failures
- Add monitoring and alerting
- Include comprehensive logging

### Docker Compose for Production

A more complete Docker Compose file for production might look like:

```yaml
version: '3.8'

services:
  weather-mcp:
    image: mcp/weather:latest
    environment:
      - WEATHER_API_KEY=${WEATHER_API_KEY}
    ports:
      - "8080:8080"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    depends_on:
      - redis
  
  redis:
    image: redis:alpine
    volumes:
      - redis-data:/data
    expose:
      - 6379

volumes:
  redis-data:
```

## Complete MCP Server Example

You can find a complete working example of this MCP server in the [Custom MCP Server Examples](https://github.com/collabnix/custom-mcp-examples) repository.

## Troubleshooting

Common issues and solutions:

- **MCP Discovery Fails**: Ensure the `/.well-known/mcp` endpoint returns the correct structure
- **Function Calls Error**: Check that your function payload matches the defined schema
- **Docker Networking**: If MCP servers can't communicate, check that they're on the same Docker network

## Conclusion

You've now learned how to build and deploy your own custom MCP server using Docker. This approach allows you to extend AI assistants like Gordon with specialized capabilities unique to your use case.

By providing an MCP interface to your own services and APIs, you enable AI assistants to work more effectively in your specific domain, creating more powerful and context-aware interactions.

## Next Steps

- [Lab 4: Deploying MCP Servers to Production](/docs/labs/production-deployment-lab)
- [Learn about MCP Authentication and Security](/docs/tutorials/mcp-auth-security)
- [Contributing Your MCP Server to the Community](/docs/contributing)
