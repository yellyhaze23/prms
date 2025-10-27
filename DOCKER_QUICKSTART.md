# Docker Quick Start Guide

**Para sa mga walang oras magbasa ng mahaba - eto na!** 🚀

## 1. Check Requirements

```powershell
# Check if Docker Desktop is running
docker --version
docker-compose --version
```

Kung walang Docker, download dito: https://www.docker.com/products/docker-desktop/

## 2. Build & Run (One Command!)

```powershell
cd C:\laragon\www\prms
docker-compose up -d --build
```

**Tagal ng build:** 5-10 minutes (first time only)

## 3. Wait for Everything to Start

```powershell
# Check status (lahat dapat "Up")
docker-compose ps
```

## 4. Test if Working

```powershell
# Run automated test
.\test-docker.ps1
```

## 5. Access the System

Open sa browser: **http://localhost**

Default login:
- Username: `admin`
- Password: (yung sa database mo)

## 6. Common Commands

```powershell
# View logs (real-time)
docker-compose logs -f

# Restart everything
docker-compose restart

# Stop everything
docker-compose down

# Stop and delete data (WARNING!)
docker-compose down -v

# Rebuild single service
docker-compose up -d --build backend
```

## Troubleshooting

### Port 80 already used (Laragon running)
**Option 1:** Stop Laragon Apache
**Option 2:** Change port sa docker-compose.yml:
```yaml
webserver:
  ports:
    - "8080:80"  # Access via localhost:8080
```

### Port 3306 already used (Laragon MySQL)
**Option 1:** Stop Laragon MySQL
**Option 2:** Change port sa docker-compose.yml:
```yaml
db:
  ports:
    - "3307:3306"
```

### Container keeps restarting
```powershell
# Check logs
docker-compose logs backend
docker-compose logs forecasting
```

### Build failed / Out of disk space
```powershell
# Clean up old Docker images/containers
docker system prune -a
```

## That's It!

Kung lahat OK sa test script, **READY NA FOR DEPLOYMENT!** 🎉

For detailed testing, check: `DOCKER_TEST_GUIDE.md`

