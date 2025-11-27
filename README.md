# Z-Image-Turbo UI & Docker Environment

This project consists of a React Frontend and a CUDA-accelerated Python Backend for the Z-Image-Turbo model.

## Prerequisites
- Docker & NVIDIA Container Toolkit (for GPU support)
- Node.js 18+

## Quick Start

### 1. Start the Backend (Docker)
This sets up the environment with CUDA 12.4, Flash Attention 3, and the latest diffusers.

```bash
cd backend
docker build -t z-image-turbo-backend .
docker run --gpus all -p 8000:8000 z-image-turbo-backend
```

### 2. Start the Frontend
```bash
npm install
npm start
```

## Configuration
- The backend runs on `localhost:8000`.
- The frontend proxy or API service points to this URL.
- Ensure your GPU has enough VRAM (approx 16GB+ recommended for 1024x1024 bfloat16).
