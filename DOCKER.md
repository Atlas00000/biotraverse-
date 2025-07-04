# Docker Setup for BioTraverse

This document provides instructions for running BioTraverse using Docker in different environments.

## 🐳 Quick Start

### Development Environment

1. **Start development server with hot reload:**
   ```bash
   docker-compose --profile dev up --build
   ```

2. **Access the application:**
   - Open http://localhost:3000 in your browser

### Production Environment

1. **Start production server:**
   ```bash
   docker-compose --profile prod up --build
   ```

2. **Access the application:**
   - Open http://localhost:3000 in your browser

### Production with Nginx Reverse Proxy

1. **Generate SSL certificates (first time only):**
   ```bash
   # Linux/Mac
   chmod +x scripts/generate-ssl.sh
   ./scripts/generate-ssl.sh
   
   # Windows
   scripts/generate-ssl.bat
   ```

2. **Start with nginx reverse proxy:**
   ```bash
   docker-compose --profile nginx up --build
   ```

3. **Access the application:**
   - Open https://localhost in your browser
   - Accept the self-signed certificate warning

## 🏗️ Docker Architecture

### Multi-Stage Build

The Dockerfile uses a multi-stage build approach:

1. **Base Stage**: Installs Node.js 18 and pnpm
2. **Development Stage**: Includes source code and development dependencies
3. **Builder Stage**: Builds the Next.js application
4. **Production Stage**: Minimal image with only production dependencies

### Services

- **biotraverse-dev**: Development server with hot reload
- **biotraverse-prod**: Production server
- **biotraverse-nginx**: Production server behind nginx
- **nginx**: Reverse proxy with SSL termination

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `WATCHPACK_POLLING` | Enable file watching in Docker | `true` (dev) |

### Ports

| Service | Port | Description |
|---------|------|-------------|
| Development | 3000 | Next.js dev server |
| Production | 3000 | Next.js production server |
| Nginx HTTP | 80 | HTTP redirect |
| Nginx HTTPS | 443 | HTTPS with SSL |

## 🚀 Deployment Options

### 1. Simple Production

```bash
# Build and run production container
docker-compose --profile prod up --build -d

# View logs
docker-compose --profile prod logs -f
```

### 2. Production with Nginx

```bash
# Build and run with nginx reverse proxy
docker-compose --profile nginx up --build -d

# View logs
docker-compose --profile nginx logs -f
```

### 3. Custom Domain

1. **Update nginx.conf:**
   ```nginx
   server_name your-domain.com;
   ```

2. **Replace SSL certificates:**
   ```bash
   # Replace ssl/cert.pem and ssl/key.pem with your certificates
   ```

3. **Restart services:**
   ```bash
   docker-compose --profile nginx restart
   ```

## 🔍 Monitoring and Logs

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f biotraverse-dev

# Production services
docker-compose --profile prod logs -f
```

### Health Check

```bash
# Check if application is running
curl http://localhost:3000

# Check nginx health endpoint
curl https://localhost/health
```

### Container Status

```bash
# List running containers
docker-compose ps

# Container resource usage
docker stats
```

## 🛠️ Development Workflow

### 1. Start Development Environment

```bash
# Start with hot reload
docker-compose --profile dev up --build

# In another terminal, view logs
docker-compose --profile dev logs -f
```

### 2. Make Changes

- Edit files in your local directory
- Changes are automatically reflected in the container
- Hot reload will restart the development server

### 3. Install New Dependencies

```bash
# Stop containers
docker-compose --profile dev down

# Rebuild with new dependencies
docker-compose --profile dev up --build
```

### 4. Debug

```bash
# Access container shell
docker-compose --profile dev exec biotraverse-dev sh

# View container files
docker-compose --profile dev exec biotraverse-dev ls -la
```

## 🔒 Security Features

### Nginx Security Headers

- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000
- Content-Security-Policy: Comprehensive CSP

### Rate Limiting

- 10 requests per second per IP
- Burst allowance of 20 requests
- Applied to all API endpoints

### SSL/TLS

- TLS 1.2 and 1.3 support
- Strong cipher suites
- HSTS headers
- Automatic HTTP to HTTPS redirect

## 📊 Performance Optimizations

### Nginx Optimizations

- Gzip compression for text files
- Static file caching (1 year for Next.js assets)
- Connection pooling
- Optimized buffer sizes

### Docker Optimizations

- Multi-stage builds for smaller images
- Alpine Linux base for minimal size
- Non-root user for security
- Layer caching optimization

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using port 3000
   lsof -i :3000
   
   # Kill process or change port in docker-compose.yml
   ```

2. **SSL certificate errors:**
   ```bash
   # Regenerate certificates
   ./scripts/generate-ssl.sh
   
   # Restart nginx
   docker-compose --profile nginx restart nginx
   ```

3. **Permission issues:**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

4. **Build failures:**
   ```bash
   # Clean build
   docker-compose down
   docker system prune -f
   docker-compose --profile dev up --build
   ```

### Debug Commands

```bash
# Check container health
docker-compose ps

# View detailed logs
docker-compose logs --tail=100

# Access container
docker-compose exec biotraverse-dev sh

# Check nginx configuration
docker-compose exec nginx nginx -t
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy with Docker
        run: |
          docker-compose --profile prod up --build -d
```

## 📝 Environment-Specific Configurations

### Development

- Hot reload enabled
- Source code mounted as volume
- Debug logging enabled
- No SSL required

### Staging

- Production build
- Environment variables for staging
- SSL with self-signed certificates
- Monitoring enabled

### Production

- Optimized production build
- SSL with valid certificates
- Rate limiting enabled
- Security headers configured
- Health checks enabled

## 🤝 Contributing

When contributing to the Docker setup:

1. Test changes in development environment
2. Verify production build works
3. Update documentation
4. Test with different profiles
5. Ensure security best practices

---

For more information, see the main [README.md](README.md) file. 