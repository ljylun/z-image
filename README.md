# Z-Image-Turbo UI & Docker Environment

This project consists of a React Frontend and a CUDA-accelerated Python Backend for the Z-Image-Turbo model.

## Prerequisites
- **Docker** & **NVIDIA Container Toolkit** (Required for GPU support)
- **NVIDIA GPU** (Ampere or newer recommended for bfloat16 and Flash Attention)
- Node.js 18+

## Architecture
- **Frontend**: React + Tailwind + Lucide (Port 3000/8080)
- **Backend**: FastAPI + PyTorch + Diffusers (Port 8000)

## Quick Start

### 1. Start the Backend (Docker)
This builds a container with CUDA 12.4, Flash Attention 3, and the latest Diffusers library.

```bash
cd backend

# Build the image (this may take a few minutes to compile Flash Attention)
docker build -t z-image-turbo-backend .

# Run the container with GPU access
docker run --gpus all -p 8000:8000 z-image-turbo-backend
```

**Note on Flash Attention 3**: 
The Dockerfile installs the standard `flash-attn` package. The code attempts to use the `_flash_3` backend. This requires specific hardware support (e.g., Hopper H100) and beta support in the libraries. The code includes a fallback to standard Flash Attention 2 if v3 fails.

### 2. Start the Frontend
Open a new terminal in the project root:

```bash
npm install
npm start
```

## Usage
1. Open the frontend URL.
2. Ensure the backend is running (Check logs for "Model loaded successfully").
3. Enter a prompt and click "Generate".
