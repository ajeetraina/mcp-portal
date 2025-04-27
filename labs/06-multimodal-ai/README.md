# Lab 6: Building Multimodal AI Applications with MCP

This lab demonstrates how to create multimodal AI applications by extending Claude's capabilities with image generation, processing, and analysis using MCP.

## Prerequisites

- Docker and Docker Compose
- Basic understanding of image processing
- Familiarity with multimodal AI concepts

## Introduction

Multimodal AI applications combine different types of data and media, such as text, images, and audio. While Claude is primarily a text-based model, MCP allows us to extend its capabilities to handle multimodal interactions. In this lab, you'll build a system that enables Claude to:

1. Generate images based on text descriptions
2. Analyze and extract data from images
3. Edit and manipulate images
4. Create visual insights from data

## Step 1: Project Setup

Create a new project directory:

```bash
mkdir mcp-multimodal
cd mcp-multimodal
mkdir -p config services/{image-generation,image-analysis,image-editing,data-visualization}
```

## Step 2: Image Generation Service

Create an image generation service using Stable Diffusion in `services/image-generation/app.py`. This will handle text-to-image generation.

## Step 3: Image Analysis Service

Create an image analysis service with OCR and object detection in `services/image-analysis/app.py`. This will extract text and identify objects in images.

## Step 4: Data Visualization Service

Create a data visualization service in `services/data-visualization/app.py`. This will generate charts and graphs from data.

## Step 5: Multimodal Server

Create a server that integrates all services in `services/multimodal-server/app.py`. This will be the main interface for MCP.

## Step 6: MCP Configuration

Create a `config/tools.json` file to connect MCP with the multimodal services:

```json
{
  "tools": [
    {
      "name": "multimodal",
      "service": "multimodal-server:5000",
      "description": "A multimodal AI service that can generate, analyze, and visualize images and data",
      "schema": {
        "type": "object",
        "functions": [
          {
            "name": "generate_image",
            "description": "Generate an image based on a text description using Stable Diffusion",
            "parameters": {
              "type": "object",
              "properties": {
                "prompt": {
                  "type": "string",
                  "description": "Text description of the image to generate"
                },
                "negative_prompt": {
                  "type": "string",
                  "description": "Things to avoid in the image (optional)"
                },
                "width": {
                  "type": "integer",
                  "description": "Width of the generated image (default: 512)",
                  "default": 512
                },
                "height": {
                  "type": "integer",
                  "description": "Height of the generated image (default: 512)",
                  "default": 512
                },
                "num_inference_steps": {
                  "type": "integer",
                  "description": "Number of denoising steps (higher = better quality but slower)",
                  "default": 50
                },
                "guidance_scale": {
                  "type": "number",
                  "description": "How closely to follow the prompt (higher = more adherence)",
                  "default": 7.5
                }
              },
              "required": ["prompt"]
            },
            "path": "/multimodal/generate-image"
          },
          {
            "name": "analyze_image",
            "description": "Analyze an image for text (OCR) or objects",
            "parameters": {
              "type": "object",
              "properties": {
                "image_url": {
                  "type": "string",
                  "description": "URL of the image to analyze"
                },
                "image_data": {
                  "type": "string",
                  "description": "Base64-encoded image data (alternative to image_url)"
                },
                "analysis_type": {
                  "type": "string",
                  "enum": ["ocr", "objects"],
                  "description": "Type of analysis to perform: 'ocr' for text extraction, 'objects' for object detection",
                  "default": "objects"
                }
              },
              "anyOf": [
                { "required": ["image_url"] },
                { "required": ["image_data"] }
              ]
            },
            "path": "/multimodal/analyze-image"
          },
          {
            "name": "visualize_data",
            "description": "Create a data visualization (chart or graph)",
            "parameters": {
              "type": "object",
              "properties": {
                "data": {
                  "type": "object",
                  "description": "Data to visualize (can be object with key-value pairs or array of objects)"
                },
                "visualization_type": {
                  "type": "string",
                  "enum": ["bar", "line", "pie"],
                  "description": "Type of visualization to create",
                  "default": "bar"
                },
                "title": {
                  "type": "string",
                  "description": "Title for the visualization",
                  "default": "Data Visualization"
                },
                "x_label": {
                  "type": "string",
                  "description": "Label for x-axis (for bar and line charts)",
                  "default": "X Axis"
                },
                "y_label": {
                  "type": "string",
                  "description": "Label for y-axis (for bar and line charts)",
                  "default": "Y Axis"
                },
                "color": {
                  "type": "string",
                  "description": "Color for the visualization",
                  "default": "blue"
                }
              },
              "required": ["data"]
            },
            "path": "/multimodal/visualize-data"
          },
          {
            "name": "process_workflow",
            "description": "Run a complex multimodal workflow combining multiple operations",
            "parameters": {
              "type": "object",
              "properties": {
                "workflow_type": {
                  "type": "string",
                  "enum": ["generate-and-analyze", "analyze-and-visualize"],
                  "description": "Type of workflow to run"
                },
                "prompt": {
                  "type": "string",
                  "description": "Text description for image generation (for generate-and-analyze workflow)"
                },
                "image_url": {
                  "type": "string",
                  "description": "URL of image to analyze (for analyze-and-visualize workflow)"
                },
                "image_data": {
                  "type": "string",
                  "description": "Base64-encoded image data (for analyze-and-visualize workflow)"
                },
                "analysis_type": {
                  "type": "string",
                  "enum": ["ocr", "objects"],
                  "description": "Type of analysis to perform",
                  "default": "objects"
                },
                "visualization_type": {
                  "type": "string",
                  "enum": ["bar", "line", "pie"],
                  "description": "Type of visualization to create",
                  "default": "bar"
                }
              },
              "required": ["workflow_type"],
              "allOf": [
                {
                  "if": {
                    "properties": { "workflow_type": { "const": "generate-and-analyze" } }
                  },
                  "then": {
                    "required": ["prompt"]
                  }
                },
                {
                  "if": {
                    "properties": { "workflow_type": { "const": "analyze-and-visualize" } }
                  },
                  "then": {
                    "anyOf": [
                      { "required": ["image_url"] },
                      { "required": ["image_data"] }
                    ]
                  }
                }
              ]
            },
            "path": "/multimodal/process-workflow"
          }
        ]
      }
    }
  ]
}
```

## Step 7: Set Up Docker Compose

Create a `docker-compose.yml` file to orchestrate all services:

```yaml
version: '3'
services:
  image-generation:
    build: ./services/image-generation
    ports:
      - "5001:5001"
    volumes:
      - ./data/images:/app/images
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
  
  image-analysis:
    build: ./services/image-analysis
    ports:
      - "5002:5002"
    volumes:
      - ./data/uploads:/app/uploads
  
  data-visualization:
    build: ./services/data-visualization
    ports:
      - "5003:5003"
    volumes:
      - ./data/visualizations:/app/visualizations
  
  multimodal-server:
    build: ./services/multimodal-server
    ports:
      - "5000:5000"
    depends_on:
      - image-generation
      - image-analysis
      - data-visualization
  
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
      - multimodal-server
```

## Step 8: Create Data Directories

Set up directories for data persistence:

```bash
mkdir -p data/{images,uploads,visualizations}
```

## Step 9: Starting the Services

Start the multimodal system:

```bash
export MCP_API_KEY=your_mcp_api_key
export CLAUDE_API_KEY=your_claude_api_key
docker-compose up --build
```

## Step 10: Testing with Claude

Here's a Python script to test image generation with Claude:

```python
import requests
import json

API_KEY = "your_claude_api_key"
MCP_URL = "http://localhost:8080/v1/messages"

headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

# Test image generation
conversation = {
    "model": "claude-3-opus-20240229",
    "messages": [
        {"role": "user", "content": "Can you generate an image of a futuristic city with flying cars?"}
    ],
    "tools": [
        {
            "name": "multimodal",
            "description": "A multimodal AI service that can generate, analyze, and visualize images and data"
        }
    ]
}

response = requests.post(MCP_URL, headers=headers, json=conversation)
result = response.json()
print(json.dumps(result, indent=2))
```

## Multimodal Workflows

### Image Generation Workflow

1. User asks Claude to create an image
2. Claude calls the `generate_image` function with a detailed prompt
3. The multimodal server forwards the request to the image generation service
4. The generated image is returned as base64-encoded data
5. Claude describes the image and provides it to the user

### Image Analysis Workflow

1. User provides an image URL or uploads an image
2. Claude calls the `analyze_image` function with the image data
3. The multimodal server forwards the request to the image analysis service
4. The analysis results (objects detected or text extracted) are returned
5. Claude summarizes the analysis results for the user

### Data Visualization Workflow

1. User provides data or asks Claude to visualize analysis results
2. Claude calls the `visualize_data` function with the formatted data
3. The multimodal server forwards the request to the data visualization service
4. The visualization image is returned as base64-encoded data
5. Claude presents the visualization and explains the insights

### Combined Workflows

Using the `process_workflow` function, Claude can perform complex operations:

- **Generate and Analyze**: Create an image and then detect objects or extract text from it
- **Analyze and Visualize**: Extract data from an image and create a chart of the results

## Business Applications

Multimodal AI systems can be applied to numerous business use cases:

1. **Content Creation**: Generate custom images for marketing, presentations, and websites
2. **Document Processing**: Extract and summarize text from scanned documents
3. **Visual Search**: Find products by image or analyze product photos
4. **Data Visualization**: Create custom charts and graphs from business data
5. **Quality Control**: Detect defects or anomalies in product images
6. **Medical Imaging**: Assist in analyzing medical images (with appropriate safeguards)
7. **Retail Analysis**: Analyze shelf photos for product placement and inventory
8. **Real Estate**: Generate or enhance property images for listings

## Next Steps

- Add image editing capabilities (resize, crop, filter)
- Implement face detection and recognition
- Add audio processing for complete multimodal experience
- Create a web interface for easy interaction
- Implement more advanced workflows combining multiple services
- Add support for video processing and analysis
- Integrate with external multimodal APIs (DALL-E, Midjourney)
- Implement fine-tuned models for specific domains
