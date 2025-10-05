# syntax=docker/dockerfile:1

# Use Python 3.12 slim image
FROM python:3.12-slim AS base

# Keeps Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED=1

# Create a non-privileged user
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/app" \
    --shell "/sbin/nologin" \
    --uid "${UID}" \
    appuser

# Install build dependencies for Python packages AND FFmpeg libraries for av
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    python3-dev \
    pkg-config \
    libavformat-dev \
    libavcodec-dev \
    libavdevice-dev \
    libavutil-dev \
    libswscale-dev \
    libswresample-dev \
    libavfilter-dev \
  && rm -rf /var/lib/apt/lists/*

# Create application directory
WORKDIR /app

# Copy requirements.txt first for better caching
COPY requirements.txt ./

# Install Python dependencies using pip
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Change ownership to non-privileged user
RUN chown -R appuser:appuser /app

# Switch to non-privileged user
USER appuser

# Pre-download ML models
RUN python src/agent.py download-files

# Run the application
CMD ["python", "src/agent.py", "start"]