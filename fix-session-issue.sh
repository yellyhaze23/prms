#!/bin/bash
# =============================================================================
# PRMS Session Fix Script for Hostinger VPS Docker Deployment
# =============================================================================
# This script fixes session persistence issues when deploying without a domain
# 
# USAGE: Run this on your VPS after Docker containers are running
# bash fix-session-issue.sh YOUR_VPS_IP
# 
# Example: bash fix-session-issue.sh 203.45.67.89
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}PRMS Session Fix Script${NC}"
echo -e "${GREEN}========================================${NC}"

# Get VPS IP from argument
VPS_IP=${1:-}

if [ -z "$VPS_IP" ]; then
    echo -e "${RED}ERROR: VPS IP not provided!${NC}"
    echo "Usage: bash fix-session-issue.sh YOUR_VPS_IP"
    echo "Example: bash fix-session-issue.sh 203.45.67.89"
    exit 1
fi

echo -e "${YELLOW}VPS IP: $VPS_IP${NC}"

# Check if we're in the project directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}ERROR: docker-compose.yml not found!${NC}"
    echo "Please run this script from your project root directory (e.g., /opt/prms)"
    exit 1
fi

echo ""
echo -e "${GREEN}Step 1: Updating CORS configuration...${NC}"

# Backup original cors.php
cp prms-backend/cors.php prms-backend/cors.php.backup

# Update cors.php with VPS IP
cat > prms-backend/cors.php << 'EOF'
<?php
/**
 * CORS Configuration - Production Ready
 * Auto-configured for VPS deployment
 */

function setCorsHeaders() {
    if (!headers_sent()) {
        // Get the origin from the request
        $origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost';
        
        // Production and Development Origins
        $allowedOrigins = [
            // VPS IP (HTTP - no domain)
            'http://VPS_IP_PLACEHOLDER',
            
            // Docker internal (same-origin)
            'http://localhost',
            'http://127.0.0.1',
            
            // Local development
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
        ];
        
        // Check if the requesting origin is allowed
        if (in_array($origin, $allowedOrigins)) {
            header("Access-Control-Allow-Origin: $origin");
            header("Access-Control-Allow-Credentials: true");
        } else {
            // For same-origin requests (most common in Docker)
            // When frontend and backend are served from same nginx
            header("Access-Control-Allow-Origin: $origin");
            header("Access-Control-Allow-Credentials: true");
        }
        
        // Standard CORS headers
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Max-Age: 3600");
        header('Content-Type: application/json; charset=utf-8');
    }
}

// Set headers
setCorsHeaders();

// Handle preflight OPTIONS request
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}
EOF

# Replace placeholder with actual VPS IP
sed -i "s/VPS_IP_PLACEHOLDER/$VPS_IP/g" prms-backend/cors.php

echo -e "${GREEN}✓ CORS updated with VPS IP: $VPS_IP${NC}"

echo ""
echo -e "${GREEN}Step 2: Adding session persistence to docker-compose.yml...${NC}"

# Backup docker-compose.yml
cp docker-compose.yml docker-compose.yml.backup

# Check if php_sessions volume already exists
if grep -q "php_sessions:" docker-compose.yml; then
    echo -e "${YELLOW}Session volume already exists in docker-compose.yml${NC}"
else
    # Add session volume to backend service
    sed -i '/backend_logs:\/var\/www\/html\/logs/a\      - php_sessions:/tmp' docker-compose.yml
    
    # Add volume declaration
    sed -i '/frontend_dist:/a\  php_sessions:\n    driver: local' docker-compose.yml
    
    echo -e "${GREEN}✓ Session persistence volume added${NC}"
fi

echo ""
echo -e "${GREEN}Step 3: Fixing session configuration in PHP files...${NC}"

# Fix check_session.php
sed -i '6a\    session_save_path('\''/tmp'\'');' prms-backend/check_session.php

# Fix logout.php  
sed -i '9a\    session_save_path('\''/tmp'\'');' prms-backend/logout.php

# Fix init_admin_session.php
sed -i '6a\    session_save_path('\''/tmp'\'');' prms-backend/init_admin_session.php

# Fix get_current_user.php
sed -i '8a\    session_save_path('\''/tmp'\'');' prms-backend/get_current_user.php

echo -e "${GREEN}✓ Session save path configured in all files${NC}"

echo ""
echo -e "${GREEN}Step 4: Restarting Docker containers...${NC}"

# Restart containers to apply changes
docker compose down
echo "Containers stopped..."

docker compose up -d
echo "Containers starting..."

# Wait for containers to be healthy
echo "Waiting for services to be ready..."
sleep 10

# Check container status
echo ""
docker compose ps

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Session Fix Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Clear your browser cache and cookies"
echo "2. Open: http://$VPS_IP"
echo "3. Try logging in again"
echo ""
echo -e "${YELLOW}If still having issues:${NC}"
echo "Check logs: docker compose logs -f backend"
echo ""
echo -e "${GREEN}Backup files created:${NC}"
echo "  - prms-backend/cors.php.backup"
echo "  - docker-compose.yml.backup"
echo ""

