FROM python:3.10-slim

# Set working directory inside the container
WORKDIR /app

RUN apt-get update && apt-get install -y libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application code
COPY . .

# Expose port 5000 for Flask
EXPOSE 5000

# Use Gunicorn as the production server
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--timeout", "150", "app:app"]
