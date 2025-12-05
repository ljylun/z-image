# ==========================================
# Stage 1: Builder (Build the React App)
# ==========================================
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker cache for dependencies
COPY package.json ./

# Configure npm mirror for China
RUN npm config set registry https://registry.npmmirror.com

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application (Vite produces artifacts in /dist)
RUN npm run build

# ==========================================
# Stage 2: Production (Serve with Nginx)
# ==========================================
FROM nginx:alpine AS production

# Remove default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built artifacts from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Run as non-root user for security (Nginx Alpine supports this but requires config tweaks if binding < 1024)
# However, standard nginx:alpine listens on 80 which is privileged.
# For simplicity in this context while remaining secure, we keep the default user 
# but rely on the minimal attack surface of the alpine image.
# If strict non-root is required, we would use nginxinc/nginx-unprivileged.

# Expose port 3000
EXPOSE 3000

# Start Nginx
# 'daemon off' runs Nginx in the foreground, which is required for Docker containers
CMD ["nginx", "-g", "daemon off;"]