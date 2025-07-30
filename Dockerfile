# Multi-stage build for HeyReach MCP Server
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S heyreach -u 1001

# Set working directory
WORKDIR /app

# Copy built application and dependencies
COPY --from=builder --chown=heyreach:nodejs /app/dist ./dist
COPY --from=builder --chown=heyreach:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=heyreach:nodejs /app/package*.json ./

# Environment variables with defaults
ENV NODE_ENV=production
ENV PORT=3000
ENV ENABLE_DNS_REBINDING_PROTECTION=true
ENV ALLOWED_HOSTS=127.0.0.1,localhost
ENV CORS_ORIGIN=*
ENV CORS_METHODS=GET,POST,DELETE,OPTIONS
ENV CORS_HEADERS=Content-Type,mcp-session-id,x-api-key,authorization
ENV CORS_EXPOSE_HEADERS=Mcp-Session-Id

# Expose port
EXPOSE 3000

# Switch to non-root user
USER heyreach

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the HTTP server
CMD ["node", "dist/http-index.js"]
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S heyreach -u 1001

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Change ownership to non-root user
RUN chown -R heyreach:nodejs /app
USER heyreach

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { \
    if (res.statusCode === 200) process.exit(0); else process.exit(1); \
  }).on('error', () => process.exit(1));"

# Start the HTTP server
CMD ["npm", "run", "start:http"]
