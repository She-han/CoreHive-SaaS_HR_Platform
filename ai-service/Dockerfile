# =========================================================================
# CoreHive AI Service - Production Dockerfile
# =========================================================================

FROM python:3.11-slim
LABEL maintainer="She-han <shehan@corehive.lk>"

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgthread-2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for layer caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download DeepFace models during build
RUN python -c "from deepface import DeepFace; DeepFace.build_model('Facenet')" || true

# Copy application code
COPY app ./app

# Create necessary directories
RUN mkdir -p uploads/employee_photos uploads/temp data/embeddings

# Expose port 8000
EXPOSE 8000

# Health check - Azure needs this
# Increased start-period to 120s to allow time for model loading
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run FastAPI with Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]