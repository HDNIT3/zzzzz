# Multi-stage build
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# Serve with built-in Node server (FIXED FOR RAILWAY)
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/build ./build

# Install serve globally (latest version)
RUN npm install -g serve@latest

# Expose port 8080 (Railway default)
EXPOSE 8080

# FIXED CMD - No --listen-tcp, use $PORT env
CMD ["sh", "-c", "serve -s build -l $PORT"]