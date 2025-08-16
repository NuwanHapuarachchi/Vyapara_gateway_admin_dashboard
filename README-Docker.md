# Vyapara Admin Dashboard - Docker Deployment

This repository contains a containerized Next.js admin dashboard for the Vyapara Gateway system.

## Quick Start with Docker

### Prerequisites
- Docker installed on your system
- Docker Compose (usually comes with Docker Desktop)

### Option 1: Using Docker Compose (Recommended)

1. **Clone and navigate to the project:**
   ```bash
   cd path/to/vyapara_gateway/Ui_admin
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env file with your actual Supabase credentials
   ```

3. **Build and run:**
   ```bash
   docker-compose up --build
   ```

4. **Access the application:**
   Open http://localhost:3000 in your browser

### Option 2: Using Docker directly

1. **Build the image:**
   ```bash
   docker build -t vyapara-admin .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \
     -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key \
     vyapara-admin
   ```
   
## Production Deployment

### For production deployment:

1. **Build production image:**
   ```bash
   docker build -t vyapara-admin:production .
   ```

2. **Run with production settings:**
   ```bash
   docker run -d \
     --name vyapara-admin \
     --restart unless-stopped \
     -p 3000:3000 \
     -e NODE_ENV=production \
     -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \
     -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key \
     vyapara-admin:production
   ```

### Using Docker Compose for production:

```bash
# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

## Docker Commands Reference

```bash
# Build the image
docker build -t vyapara-admin .

# Run container
docker run -p 3000:3000 vyapara-admin

# Run in background
docker run -d -p 3000:3000 vyapara-admin

# Stop container
docker stop <container_id>

# Remove container
docker rm <container_id>

# Remove image
docker rmi vyapara-admin

# View running containers
docker ps

# View logs
docker logs <container_id>
```

## Sharing the Application

To share this application with others:

1. **Share the entire project folder** containing:
   - Dockerfile
   - docker-compose.yml
   - .env.example
   - All source code

2. **Or build and share the Docker image:**
   ```bash
   # Build and tag
   docker build -t vyapara-admin:latest .
   
   # Save to tar file
   docker save vyapara-admin:latest > vyapara-admin.tar
   
   # Load on another machine
   docker load < vyapara-admin.tar
   ```

3. **Or push to a Docker registry:**
   ```bash
   # Tag for registry
   docker tag vyapara-admin:latest your-registry/vyapara-admin:latest
   
   # Push to registry
   docker push your-registry/vyapara-admin:latest
   ```

## Troubleshooting

- **Port already in use:** Change the port mapping: `-p 3001:3000`
- **Environment variables not working:** Ensure your .env file is properly formatted
- **Build fails:** Check that all dependencies in package.json are correct
- **Application won't start:** Check logs with `docker logs <container_id>`

## Features

- ✅ Multi-stage Docker build for optimized image size
- ✅ Non-root user for security
- ✅ Health checks included
- ✅ Production-ready configuration
- ✅ Environment variable support
- ✅ Docker Compose for easy deployment
