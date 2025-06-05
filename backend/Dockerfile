FROM python:3.10

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    python3-dev \
    libpq-dev \
    libfreetype6-dev \
    pkg-config \
    libpng-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first
COPY backend/requirements.txt .

# Install Python packages
RUN python -m pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy the rest of the application
COPY backend/ .

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PYTHONPATH=/app
ENV PORT=8080

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
CMD ["python", "app.py"] 