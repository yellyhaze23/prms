# Multi-stage build for React Frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Using npm install instead of npm ci for better compatibility on low-memory VPS
RUN npm install --production=false

# Copy source files
COPY . .

# Set base path and API URLs for Docker deployment
ARG VITE_API_BASE_URL
ARG VITE_STAFF_API_BASE_URL
ENV VITE_BASE_PATH=/
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_STAFF_API_BASE_URL=$VITE_STAFF_API_BASE_URL

# Build for production
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

