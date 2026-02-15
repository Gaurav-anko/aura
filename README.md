# AURA - Smart Product Styler

AI-powered interior design visualization system using Google Vertex AI, ADK, and Gemini.

## Overview

AURA is a multi-agent styling system that allows planners to:
1. Filter products from a catalog
2. Select 1-4 home products
3. Choose styling presets (mood, style, color theme, room type)
4. Generate photorealistic styled lifestyle images featuring all selected products
5. Regenerate images using feedback

## Tech Stack

- **Backend**: Python, FastAPI, Google ADK, Vertex AI
- **Frontend**: React, TypeScript, TailwindCSS, React Query
- **AI Models**: Gemini via Vertex AI for reasoning and image generation

## Project Structure

```
home-style-ai/
├── backend/
│   ├── agents/
│   │   ├── filter_agent.py      # Product filtering agent
│   │   ├── styling_agent.py     # Styling plan generation agent
│   │   └── image_agent.py       # Image generation agent
│   ├── services/
│   │   └── image_fetcher.py     # Product image fetching
│   ├── main.py                  # FastAPI server
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── api/                 # API client
│   │   ├── components/          # React components
│   │   ├── hooks/               # React Query hooks
│   │   ├── types/               # TypeScript types
│   │   └── App.tsx              # Main app
│   └── package.json             # Node dependencies
├── data/
│   └── products.json            # Product catalog
├── .env                         # Environment variables
└── README.md
```

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Vertex AI API** enabled in your project
3. **Python 3.10+**
4. **Node.js 18+**
5. **Google Cloud CLI** installed and configured

## Setup Instructions

### 1. Google Cloud Authentication

```bash
# Login to Google Cloud
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Set up application default credentials
gcloud auth application-default login

# Enable Vertex AI API
gcloud services enable aiplatform.googleapis.com
```

### 2. Environment Configuration

Edit the `.env` file in the project root:

```env
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_GENAI_USE_VERTEXAI=True

# Backend Configuration
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000

# Frontend Configuration (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
python main.py
```

The backend will start at `http://localhost:8000`

### 4. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend will start at `http://localhost:5173`

## Running the Application

### Start Backend (Terminal 1)

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python main.py
```

### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

### Access the App

Open your browser to `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Get filtered products |
| GET | `/categories` | Get available categories |
| GET | `/colors` | Get available colors |
| GET | `/price-range` | Get price range |
| GET | `/styling/moods` | Get mood options |
| GET | `/styling/styles` | Get style options |
| GET | `/styling/color-themes` | Get color theme options |
| GET | `/styling/rooms` | Get room type options |
| POST | `/generate-style` | Generate styled image |
| POST | `/regenerate` | Regenerate with feedback |

## Usage Flow

1. **Filter Products**: Use the category, color, and price filters to narrow down products
2. **Select Products**: Click on 1-4 products to select them for styling
3. **Choose Presets**: Select mood, style, color theme, and room type
4. **Model Quality**: Toggle between "Fast" (quicker) and "High Quality" (better results)
5. **Generate**: Click "Generate Styled Image" to create the visualization
6. **Refine**: Enter feedback and click "Regenerate" to improve the image

## Model Quality Options

- **Fast**: Uses `gemini-2.0-flash-preview-image-generation` - Faster generation, good quality
- **High Quality**: Uses `gemini-2.0-flash-exp` - Best quality, slower generation

## Troubleshooting

### "No image generated" Error

- Ensure your Google Cloud project has Vertex AI API enabled
- Check that your credentials are properly configured
- Verify the `GOOGLE_CLOUD_PROJECT` and `GOOGLE_CLOUD_LOCATION` in `.env`

### Product Images Not Loading

- The app fetches images from Kmart URLs, which may be rate-limited
- Images that fail to load are skipped, and the generation continues with available images

### CORS Errors

- Ensure the backend is running on port 8000
- Check that `FRONTEND_URL` in `.env` matches your frontend URL

## Disclaimer

AI-generated images are stylized representations and may not be pixel-perfect reproductions of the original products. Results are AI-generated for visualization purposes only.

## License

MIT License - Built for hackathon purposes
