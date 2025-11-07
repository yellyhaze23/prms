<?php
/**
 * Email Configuration for Password Reset Codes
 * Reads from environment variables (set in .env file or docker-compose.yml)
 * 
 * For Local Development (Laragon):
 * - Configure directly in this file, or
 * - Set environment variables
 * 
 * For Production (Docker/VPS):
 * - Set environment variables in root .env file
 * - docker-compose.yml will pass them to backend container
 */
return [
    'smtp_host' => getenv('SMTP_HOST') ?: 'smtp.gmail.com',
    'smtp_port' => (int)(getenv('SMTP_PORT') ?: 587),
    'smtp_username' => getenv('SMTP_USERNAME') ?: '',  // Set in .env for production
    'smtp_password' => getenv('SMTP_PASSWORD') ?: '',  // Set in .env for production
    'smtp_encryption' => getenv('SMTP_ENCRYPTION') ?: 'tls',
    'from_email' => getenv('FROM_EMAIL') ?: '',  // Set in .env for production
    'from_name' => getenv('FROM_NAME') ?: 'PRMS System',
];
?>

