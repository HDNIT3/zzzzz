# Multi-stage build
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# Serve with built-in Node server (no nginx)
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/build ./build

# Install serve to run the app
RUN npm install -g serve

# Expose port and start
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]