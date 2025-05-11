# Lab 2: Building a Custom MCP Server

In this lab, you'll learn how to build your own custom MCP server that provides specialized functionality to Claude.

## Prerequisites

- Completion of Lab 1
- Docker and Docker Compose installed
- Basic knowledge of Python
- Understanding of RESTful APIs

## Introduction

One of the most powerful aspects of MCP is the ability to create custom tools that extend Claude's capabilities. In this lab, you'll build a weather service that provides real-time weather information.

## Step 1: Setting Up Your Project Structure

Create a new directory for your custom MCP server:

```bash
mkdir weather-mcp-server
cd weather-mcp-server
```

Create the following file structure:

```
weather-mcp-server/
??? Dockerfile
??? requirements.txt
??? server.py
??? docker-compose.yml
```

## Step 2: Creating the Server Code

First, create the `requirements.txt` file:

```
flask==2.0.1
requests==2.26.0
pyyaml==6.0
```

Next, create the server code in `server.py`:

```python
from flask import Flask, request, jsonify
import requests
import os
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

# In a production environment, you would use a secure method to store this
WEATHER_API_KEY = os.environ.get('WEATHER_API_KEY', 'your_weather_api_key')
WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather"

@app.route('/weather', methods=['POST'])
def get_weather():
    try:
        data = request.json
        location = data.get('location', 'San Francisco')
        units = data.get('units', 'metric')
        
        # Make request to weather API
        params = {
            'q': location,
            'appid': WEATHER_API_KEY,
            'units': units
        }
        
        response = requests.get(WEATHER_API_URL, params=params)
        weather_data = response.json()
        
        # Format the response
        if response.status_code == 200:
            result = {
                'location': location,
                'temperature': weather_data['main']['temp'],
                'description': weather_data['weather'][0]['description'],
                'humidity': weather_data['main']['humidity'],
                'wind_speed': weather_data['wind']['speed'],
                'units': units
            }
            return jsonify(result)
        else:
            return jsonify({
                'error': f"Weather API returned: {weather_data.get('message', 'Unknown error')}"
            }), 400
    
    except Exception as e:
        app.logger.error(f"Error processing request: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
```

## Step 3: Creating the Dockerfile

Create a `Dockerfile` to package your server:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY server.py .

EXPOSE 8000

CMD ["python", "server.py"]
```

## Step 4: Setting Up Docker Compose

Create a `docker-compose.yml` file that includes both your custom server and the MCP proxy:

```yaml
version: '3'
services:
  weather-server:
    build: .
    ports:
      - "8000:8000"
    environment:
      - WEATHER_API_KEY=${WEATHER_API_KEY}
  
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
      - weather-server
```

## Step 5: Creating the MCP Tool Configuration

Create a directory for your config:

```bash
mkdir config
```

Create a `config/tools.json` file:

```json
{
  "tools": [
    {
      "name": "weather",
      "service": "weather-server:8000",
      "description": "Gets current weather information for a location",
      "schema": {
        "type": "function",
        "function": {
          "name": "get_weather",
          "description": "Get current weather information for a location",
          "parameters": {
            "type": "object",
            "properties": {
              "location": {
                "type": "string",
                "description": "City name or location (e.g., 'New York', 'Tokyo')"
              },
              "units": {
                "type": "string",
                "enum": ["metric", "imperial"],
                "description": "Temperature units (metric for Celsius, imperial for Fahrenheit)"
              }
            },
            "required": ["location"]
          }
        }
      },
      "path": "/weather"
    }
  ]
}
```

## Step 6: Running Your Custom MCP Server

Build and start the services:

```bash
export WEATHER_API_KEY=your_openweathermap_api_key
export MCP_API_KEY=your_mcp_api_key
export CLAUDE_API_KEY=your_claude_api_key
docker-compose up --build
```

## Step 7: Testing Your Custom Server

Create a file called `test_weather.py`:

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
        {"role": "user", "content": "What's the weather like in Tokyo right now?"}
    ],
    "tools": [
        {
            "name": "weather",
            "description": "Gets current weather information for a location"
        }
    ]
}

response = requests.post(MCP_URL, headers=headers, json=conversation)
result = response.json()
print(json.dumps(result, indent=2))
```

Run the script:

```bash
python test_weather.py
```

## Next Steps

- Add more functionality to your weather server, such as forecasts
- Create additional custom MCP servers for other domains
- Explore ways to make your server more robust with error handling
- Try integrating multiple custom servers together

## Troubleshooting

- If you see connection errors, check that all services are running
- Verify that your API keys are correctly set
- Check the server logs for detailed error messages
