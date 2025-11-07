# PHP Backend Dockerfile for PRMS
FROM php:8.2-fpm

# Install system dependencies including Python and Docker CLI
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    python3 \
    python3-pip \
    python3-venv \
    gcc \
    g++ \
    gfortran \
    libopenblas-dev \
    liblapack-dev \
    ca-certificates \
    gnupg \
    lsb-release \
    && docker-php-ext-install pdo_mysql mysqli mbstring exif pcntl bcmath gd zip opcache \
    && rm -rf /var/lib/apt/lists/*

# Install Docker CLI (for docker exec commands in backup functionality)
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null \
    && apt-get update \
    && apt-get install -y docker-ce-cli \
    && rm -rf /var/lib/apt/lists/*

# Create symlink for python command
RUN ln -s /usr/bin/python3 /usr/bin/python

# Configure PHP settings
RUN echo "upload_max_filesize = 10M" > /usr/local/etc/php/conf.d/uploads.ini \
    && echo "post_max_size = 10M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "max_execution_time = 300" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "max_input_time = 300" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "memory_limit = 256M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "date.timezone = Asia/Manila" >> /usr/local/etc/php/conf.d/uploads.ini

# Enable OPcache for performance
RUN echo "opcache.enable=1" > /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.memory_consumption=128" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.interned_strings_buffer=8" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.max_accelerated_files=4000" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.revalidate_freq=60" >> /usr/local/etc/php/conf.d/opcache.ini

# Set working directory
WORKDIR /var/www/html

# Install Python dependencies for forecasting
COPY requirements.txt /tmp/requirements.txt
RUN pip3 install --no-cache-dir --break-system-packages -r /tmp/requirements.txt && rm /tmp/requirements.txt

# Copy application files
COPY . /var/www/html/

# Create necessary directories
RUN mkdir -p /var/www/html/uploads \
    && mkdir -p /var/www/html/logs \
    && mkdir -p /var/www/html/backups \
    && mkdir -p /var/www/forecasting \
    && mkdir -p /var/www/forecasting/cache \
    && chmod -R 775 /var/www/html/uploads \
    && chmod -R 775 /var/www/html/logs \
    && chmod -R 775 /var/www/html/backups \
    && chmod -R 775 /var/www/forecasting

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chown -R www-data:www-data /var/www/forecasting

# Configure PHP session settings to use /tmp
RUN echo "session.save_path = \"/tmp\"" >> /usr/local/etc/php/conf.d/session.ini \
    && echo "session.gc_probability = 1" >> /usr/local/etc/php/conf.d/session.ini \
    && echo "session.gc_divisor = 100" >> /usr/local/etc/php/conf.d/session.ini

EXPOSE 9000
COPY session.ini /usr/local/etc/php/conf.d/session.ini
CMD ["php-fpm"]

