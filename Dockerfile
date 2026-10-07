# Dockerfile — SIMAP Kejati
# Multi-stage build:
#   Stage 1: PHP Dependencies + Wayfinder Generate
#   Stage 2: PHP 8.4-FPM Production Image

FROM php:8.4-cli-alpine AS php-deps

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Cache file dependencies
COPY composer.json composer.lock ./

# Install dependencies (termasuk dev deps untuk bind-mount & testing)
RUN composer install \
    --no-scripts \
    --no-interaction \
    --optimize-autoloader \
    --ignore-platform-reqs

COPY --chown=www-data:www-data . .

RUN composer dump-autoload --optimize --no-interaction

# Generate Wayfinder TypeScript types
RUN php artisan wayfinder:generate --with-form 2>/dev/null || true


# STAGE 2: PHP 8.4-FPM Final Image
FROM php:8.4-fpm-alpine

LABEL maintainer="SIMAP Kejati Team"
LABEL description="PHP 8.4-FPM with extensions for Laravel 13"

# Install system dependencies
RUN apk add --no-cache \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    libzip-dev \
    libxml2-dev \
    icu-dev \
    oniguruma-dev \
    linux-headers \
    $PHPIZE_DEPS \
    curl \
    supervisor \
    freetype \
    libjpeg-turbo \
    libpng \
    libzip \
    icu-libs

# Configure & Install PHP Extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg

RUN docker-php-ext-install -j$(nproc) \
    pdo_mysql \
    gd \
    zip \
    xml \
    bcmath \
    intl \
    mbstring \
    opcache \
    pcntl \
    exif

# Install Redis
RUN pecl install redis \
    && docker-php-ext-enable redis

# Cleanup build dependencies
RUN apk del $PHPIZE_DEPS linux-headers \
    freetype-dev libjpeg-turbo-dev libpng-dev \
    libzip-dev libxml2-dev icu-dev oniguruma-dev

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy Application Code
COPY --chown=www-data:www-data . .

COPY --from=php-deps /app/vendor ./vendor

# Regenerate autoload + package discovery
RUN composer dump-autoload --optimize --no-interaction \
    && php artisan package:discover --ansi

# Directory Permissions
RUN chown -R www-data:www-data /var/www/html/storage \
    /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage \
    /var/www/html/bootstrap/cache

# Supervisor Config
COPY docker/supervisor/supervisord.conf /etc/supervisord.conf

# Entrypoint Script
COPY docker/scripts/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 9000

# Healthcheck opsional (uncomment jika diperlukan orchestration)
# HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
#     CMD php -r 'exit extension_loaded("pdo_mysql") ? 0 : 1;'

ENTRYPOINT ["entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisord.conf", "-n"]
