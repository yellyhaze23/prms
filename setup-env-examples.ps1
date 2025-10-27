# PRMS - Create Environment Example Files
# Run this script to create all .env.example files

Write-Host "Creating environment example files..." -ForegroundColor Green

# Frontend .env.example
$frontendEnvExample = @"
# PRMS Frontend Environment Configuration Template
# Copy this file to .env and update with your values

# LOCAL DEVELOPMENT (Laragon/XAMPP)
VITE_API_BASE_URL=http://localhost/prms/prms-backend
VITE_STAFF_API_BASE_URL=http://localhost/prms/prms-backend/api/staff
VITE_BASE_PATH=/prms/prms-frontend/dist/

# VPS PRODUCTION (Using IP Address)
# VITE_API_BASE_URL=http://YOUR_VPS_IP/prms-backend
# VITE_STAFF_API_BASE_URL=http://YOUR_VPS_IP/prms-backend/api/staff
# VITE_BASE_PATH=/

# VPS PRODUCTION (Using Domain with SSL)
# VITE_API_BASE_URL=https://yourdomain.com/prms-backend
# VITE_STAFF_API_BASE_URL=https://yourdomain.com/prms-backend/api/staff
# VITE_BASE_PATH=/
"@

$frontendEnvExample | Out-File -FilePath "prms-frontend\.env.example" -Encoding utf8 -Force
Write-Host "✓ Created prms-frontend\.env.example" -ForegroundColor Cyan

# Forecasting .env.example
$forecastingEnvExample = @"
# PRMS Forecasting - Database Configuration Template
# Copy this file to .env and update with your database credentials

# Database Connection
DB_HOST=localhost
DB_USER=prms_user
DB_PASSWORD=your_password_here
DB_NAME=prms_db
DB_PORT=3306

# Forecasting Configuration
FORECAST_PERIODS=12
MIN_DATA_POINTS=30
CONFIDENCE_LEVEL=0.95

# File Paths
OUTPUT_CSV=forecast_result.csv
CACHE_DIR=cache/
"@

$forecastingEnvExample | Out-File -FilePath "forecasting\.env.example" -Encoding utf8 -Force
Write-Host "✓ Created forecasting\.env.example" -ForegroundColor Cyan

# Backend .htaccess (optional but recommended)
$htaccess = @"
# Security
<Files "config.php">
    Require all denied
</Files>

<Files "config.example.php">
    Require all denied
</Files>

<FilesMatch "\.(sql|log)$">
    Require all denied
</FilesMatch>

# PHP Configuration
php_value upload_max_filesize 10M
php_value post_max_size 10M
php_value max_execution_time 300
"@

$htaccess | Out-File -FilePath "prms-backend\.htaccess" -Encoding utf8 -Force
Write-Host "✓ Created prms-backend\.htaccess" -ForegroundColor Cyan

Write-Host "`n✅ All environment example files created successfully!" -ForegroundColor Green
Write-Host "`n📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Copy prms-frontend\.env.example to prms-frontend\.env"
Write-Host "2. Copy forecasting\.env.example to forecasting\.env"
Write-Host "3. Update the values in .env files with your actual configuration"
Write-Host "4. Rebuild frontend: cd prms-frontend && npm run build"

