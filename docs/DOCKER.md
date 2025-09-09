# Docker Deployment Guide

This guide explains how to build and deploy the Bible Static Site using Docker.

## Quick Start

### Build and Run
```bash
# Build the Docker image
npm run docker:build

# Run the container
npm run docker:run
```

The site will be available at [http://localhost:8080](http://localhost:8080)

### Using Docker Compose
```bash
# Run production site
npm run docker:up

# Run development site with live reloading
npm run docker:dev

# Stop all containers
npm run docker:down
```

## Docker Architecture

### Multi-Stage Build
The Dockerfile uses a multi-stage build process:

1. **Builder Stage** (`node:20-alpine`)
   - Installs all dependencies including dev tools
   - Runs `npm run build:production` to generate static files
   - Optimizes CSS and HTML

2. **Production Stage** (`nginx:alpine`)
   - Copies built static files to nginx document root
   - Uses optimized nginx configuration for serving static content
   - Includes security headers and caching rules

### Image Size Optimization
- Multi-stage build eliminates build dependencies from final image
- Uses Alpine Linux base images for smaller footprint
- Only static files are included in final production image

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run docker:build` | `./docker-build.sh` | Build the Docker image |
| `npm run docker:run` | `docker run -p 8080:80 explore-scripture:latest` | Run container directly |
| `npm run docker:up` | `docker-compose up` | Start with docker-compose |
| `npm run docker:dev` | `docker-compose --profile dev up bible-site-dev` | Development mode |
| `npm run docker:down` | `docker-compose down` | Stop all containers |

## Docker Compose Services

### Production Service (`bible-site`)
- **Port:** 8080 → 80
- **Environment:** production
- **Features:** Health checks, restart policy
- **Image:** Optimized nginx serving static files

### Development Service (`bible-site-dev`)
- **Port:** 8081 → 8080
- **Environment:** development  
- **Features:** Live reloading, volume mounting
- **Usage:** `docker-compose --profile dev up bible-site-dev`

## Configuration Files

### Dockerfile
Multi-stage build configuration:
- Builder stage: Node.js 20 Alpine with build tools
- Production stage: Nginx Alpine serving static files

### nginx.conf
Production nginx configuration with:
- Gzip compression
- Security headers
- Caching rules
- Clean URL handling

### docker-compose.yml
Services configuration with:
- Production and development profiles
- Health checks
- Volume mounting for development

### .dockerignore
Excludes unnecessary files:
- `node_modules/`, build artifacts, logs
- Test results, IDE files, documentation

## Deployment Options

### 1. Direct Docker Run
```bash
# Build image
docker build -t explore-scripture:latest .

# Run container
docker run -d \
  --name bible-site \
  --restart unless-stopped \
  -p 8080:80 \
  explore-scripture:latest
```

### 2. Docker Compose (Recommended)
```bash
# Start production services
docker-compose up -d

# View logs
docker-compose logs -f

# Scale if needed (not applicable for static site)
docker-compose up -d --scale bible-site=1
```

### 3. Development Mode
```bash
# Start development server with live reloading
docker-compose --profile dev up bible-site-dev

# Access at http://localhost:8081
# Changes to source files will trigger rebuilds
```

## Health Checks

The container includes automated health checks:
- **Endpoint:** `http://localhost/`
- **Interval:** 30 seconds
- **Timeout:** 10 seconds
- **Retries:** 3 attempts
- **Start Period:** 10 seconds

Check health status:
```bash
docker inspect bible-site --format='{{.State.Health.Status}}'
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Build environment |

## Performance Features

### Nginx Optimizations
- **Gzip Compression:** Enabled for text files
- **Static File Caching:** 1 year for assets, 1 hour for HTML
- **Security Headers:** X-Frame-Options, CSP, etc.
- **Clean URLs:** Automatic `.html` extension handling

### Build Optimizations
- **CSS Minification:** Using cssnano
- **HTML Compression:** Using htmlnano
- **Asset Optimization:** Minified JavaScript and CSS

## Monitoring & Logging

### Container Logs
```bash
# View logs
docker-compose logs bible-site

# Follow logs
docker-compose logs -f bible-site

# View last 100 lines
docker logs --tail 100 bible-site
```

### Nginx Access Logs
Logs are available inside container at:
- Access logs: `/var/log/nginx/access.log`
- Error logs: `/var/log/nginx/error.log`

### Performance Monitoring
The site includes performance benchmarking:
```bash
# Run performance tests on running container
npm run test:performance
npm run test:benchmark
npm run performance:report
```

## Troubleshooting

### Common Issues

#### Build Fails
```bash
# Check if Docker is running
docker --version

# Clean build cache
docker system prune -a

# Rebuild from scratch
docker build --no-cache -t explore-scripture:latest .
```

#### Container Won't Start
```bash
# Check container status
docker ps -a

# View container logs
docker logs bible-site

# Check nginx configuration
docker exec bible-site nginx -t
```

#### Site Not Accessible
```bash
# Check port mapping
docker port bible-site

# Test local connection
curl -I http://localhost:8080

# Check nginx status
docker exec bible-site nginx -s status
```

### Resource Requirements

**Minimum System Requirements:**
- **RAM:** 2GB available
- **Storage:** 1GB free space
- **Docker:** Version 20.0+ recommended

**Build Resources:**
- **Build Time:** ~2-3 minutes
- **Build Memory:** ~500MB peak usage
- **Final Image Size:** ~50MB (nginx + static files)

## Production Deployment

### Docker Hub Deployment
```bash
# Tag for Docker Hub
docker tag explore-scripture:latest username/explore-scripture:latest

# Push to Docker Hub
docker push username/explore-scripture:latest

# Deploy on production server
docker pull username/explore-scripture:latest
docker run -d --name bible-site --restart always -p 80:80 username/explore-scripture:latest
```

### Cloud Deployment Examples

#### AWS ECS
```json
{
  "family": "explore-scripture",
  "networkMode": "awsvpc",
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "bible-site",
      "image": "username/explore-scripture:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ]
    }
  ]
}
```

#### Google Cloud Run
```bash
# Deploy to Cloud Run
gcloud run deploy explore-scripture \
  --image username/explore-scripture:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Security Considerations

### Nginx Security Headers
```nginx
# Security headers included in nginx.conf
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

### Container Security
- Non-root user execution in nginx container
- Minimal Alpine Linux base image
- No sensitive data in container layers
- Health checks prevent deployment of broken containers

## Support

For issues with Docker deployment:
1. Check container logs: `docker logs bible-site`
2. Verify nginx configuration: `docker exec bible-site nginx -t`
3. Test health endpoint: `curl http://localhost:8080/`
4. Review this documentation for common solutions

For development questions, see the main project README.md file.