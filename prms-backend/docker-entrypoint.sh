#!/bin/sh
set -e

# Create session directory if it doesn't exist
mkdir -p /var/lib/php/sessions

# Set proper permissions
chown -R www-data:www-data /var/lib/php/sessions
chmod -R 770 /var/lib/php/sessions

# Execute the main command (php-fpm)
exec "$@"

