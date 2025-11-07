#!/bin/bash
set -e

# Fix Docker socket permissions
# Get the GID of the docker socket (if mounted)
if [ -e /var/run/docker.sock ]; then
    DOCKER_GID=$(stat -c '%g' /var/run/docker.sock 2>/dev/null || echo "")
    if [ ! -z "$DOCKER_GID" ] && [ "$DOCKER_GID" != "0" ]; then
        # Update docker group GID to match socket
        groupmod -g "$DOCKER_GID" docker 2>/dev/null || true
        # Ensure www-data is in docker group
        usermod -aG docker www-data 2>/dev/null || true
    fi
    # Set socket permissions (if we can)
    chmod 666 /var/run/docker.sock 2>/dev/null || true
fi

# Fix backup directory permissions
mkdir -p /var/www/html/backups
chown -R www-data:www-data /var/www/html/backups
chmod -R 775 /var/www/html/backups

# Execute the original command
exec "$@"

