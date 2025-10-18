# Multi-stage build
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# Serve with built-in Node server (fixed for Railway)
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/build ./build

# Install serve globally
RUN npm install -g serve

# Expose dynamic PORT
EXPOSE $PORT

CMD ["sh", "-c", "serve -s build -l $PORT --listen-tcp 0.0.0.0"]