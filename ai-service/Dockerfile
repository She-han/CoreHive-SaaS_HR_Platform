# =========================================================================
# CoreHive AI Service - Production Dockerfile
# Python FastAPI application with DeepFace face recognition
# =========================================================================

# Use Python 3.11 slim image (lightweight)
FROM python:3.11-slim
LABEL maintainer="She-han <shehan@corehive.lk>"

# Set working directory
WORKDIR /app

# Install system dependencies required for OpenCV and DeepFace
# Updated for Debian Trixie compatibility
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgthread-2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for layer caching)
COPY requirements.txt .

# Install Python dependencies
# --no-cache-dir reduces image size
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download DeepFace models during build
# This avoids downloading during first request (faster startup)
RUN python -c "from deepface import DeepFace; DeepFace.build_model('Facenet')"

# Copy application code
COPY app ./app

# Create necessary directories
RUN mkdir -p uploads/employee_photos uploads/temp data/embeddings

# Expose port 8000 (FastAPI default)
EXPOSE 8000

# Run FastAPI with Uvicorn
# --host 0.0.0.0 allows external access
# --port 8000 is the default port
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]