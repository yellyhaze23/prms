# Python Forecasting Dockerfile
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    gfortran \
    libopenblas-dev \
    liblapack-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Create cache directory
RUN mkdir -p /app/cache && chmod 777 /app/cache

# Set Python to run in unbuffered mode
ENV PYTHONUNBUFFERED=1

# Keep container running as a service (PHP will call the scripts on-demand)
CMD ["tail", "-f", "/dev/null"]

