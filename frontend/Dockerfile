# =========================================================================
# Stage 1: Build the React Application
# =========================================================================
# Use official Node.js 22 (LTS version) Alpine image
# Alpine image is lightweight, reducing build stage size
FROM node:22-alpine AS build
LABEL maintainer="She-han <shehan@corehive.lk>"

# Set working directory for the application
WORKDIR /app

# First copy package.json and package-lock.json (or yarn.lock/pnpm-lock.yaml)
# This allows dependency layer caching, speeding up builds when source code changes
COPY package*.json ./

# Use 'npm ci' for production builds
# This is faster than 'npm install' and more reliable as it installs exact dependencies from package-lock.json
RUN npm ci

# Copy the rest of the source code
COPY . .

# Create Vite production build
# VITE_API_BASE_URL can be set during build time
ARG VITE_API_BASE_URL
ARG VITE_AI_SERVICE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_AI_SERVICE_URL=${VITE_AI_SERVICE_URL}
RUN npm run build


# =========================================================================
# Stage 2: Serve the application with Nginx
# =========================================================================
# Use lightweight Nginx image to significantly reduce final image size
FROM nginx:1.27.0-alpine

# Security Best Practice: Use Nginx default user
# Use custom config to give permissions to www-data user

# Copy built files from build stage to Nginx server's default folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration file (to handle React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Port that container needs to run on (Nginx default port)
EXPOSE 80

# Start Nginx server in non-daemon mode
# Running as foreground process is better for Docker containers
CMD ["nginx", "-g", "daemon off;"]