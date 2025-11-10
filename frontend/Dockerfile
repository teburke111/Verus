# --- STAGE 1: Build the static application ---
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy the package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy source code and build the application
# **CRITICAL FIX:** This step must run *after* installing dependencies
# to ensure local changes (like the fixed API URL) are included.
COPY . .
RUN npm run build

# --- STAGE 2: Serve the application with Nginx ---
FROM nginx:stable-alpine

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built React application files from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80 (Nginx default)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
