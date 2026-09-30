# Dockerfile — SIMAP Kejati
# Multi-stage build (2 tahap):
#   Stage 1 (php-deps) → Composer install + generate Wayfinder types
#   Stage 2 (final)    → PHP 8.4-FPM production image
#
# Build aset frontend dilakukan oleh service Node di Docker Compose sebelum
# image aplikasi dibuat.


# STAGE 1: PHP Dependencies + Wayfinder Generate
FROM php:8.4-cli-alpine AS php-deps

# Composer (dari image resmi, bukan di-install manual)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy hanya file dependency dulu (cache layer)
COPY composer.json composer.lock ./

# Install semua PHP dependencies (TERMINAH dev dependencies — wajib lihat
# catatan di bawah). --ignore-platform-reqs karena Stage 1 tidak punya ext-gd
# (phpspreadsheet butuh), tapi tidak masalah karena Stage 1 hanya menjalankan
# composer dan artisan wayfinder:generate.
#
# Catatan kenapa include-dev:
#   - bootstrap/cache/packages.php di bind-mount dari host di development
#     berisi provider dari require-dev (Laravel\Boost\BoostServiceProvider).
#     Tanpa boost ter-install, container crash di boot.
#   - Stage ini juga dipakai untuk `artisan test`, `pint`, `phpstan`.
RUN composer install \
    --no-scripts \
    --no-interaction \
    --optimize-autoloader \
    --ignore-platform-reqs

# Copy seluruh source code (vendor/ Sudah di-exclude oleh .dockerignore)
COPY --chown=www-data:www-data . .

# Regenerate autoload (source code sekarang tersedia)
RUN composer dump-autoload --optimize --no-interaction

# Generate Wayfinder TypeScript types agar tersedia untuk service Node.
RUN php artisan wayfinder:generate --with-form 2>/dev/null || true


# STAGE 2: PHP 8.4-FPM — Image Final / Production
FROM php:8.4-fpm-alpine

LABEL maintainer="SIMAP Kejati Team"
LABEL description="PHP 8.4-FPM with extensions for Laravel 13"

# Install system dependencies
# Alasan tiap package:
#   freetype, libjpeg, libpng  → GD (upload foto, manipulasi gambar, PDF chart)
#   libzip                      → ZIP (phpspreadsheet, download file)
#   libxml2                     → XML (phpspreadsheet Excel/CSV)
#   icu                         → intl (format angka/tanggal Indonesia)
#   oniguruma                   → mbstring (string multi-byte UTF-8)
#   linux-headers               → compile extension
#   $PHPIZE_DEPS               → build tools untuk extension (pebbles, dll)
#   curl                        → HTTP client
#   supervisor                  → queue worker di background
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
    # Runtime libraries (bukan -dev) untuk image final
    freetype \
    libjpeg-turbo \
    libpng \
    libzip \
    icu-libs

# Configure & Install PHP Extensions
# GD harus di-configure sebelum install (butuh JPEG + FreeType support)
RUN docker-php-ext-configure gd --with-freetype --with-jpeg

# Install semua extension yang dibutuhkan
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

# Install Redis via PECL
# Cache, session, dan queue broker
RUN pecl install redis \
    && docker-php-ext-enable redis

# Cleanup build dependencies (hemat ~100MB di image final)
RUN apk del $PHPIZE_DEPS linux-headers \
    freetype-dev libjpeg-turbo-dev libpng-dev \
    libzip-dev libxml2-dev icu-dev oniguruma-dev

# Install Composer (untuk post-install tasks di Stage 3)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Setup Working Directory
WORKDIR /var/www/html

# Copy Application Code
# Source code dikopi dengan ownership www-data (hindari permission issues)
COPY --chown=www-data:www-data . .

# Copy vendor dari Stage 1 (sudah ter-install, termasuk dev deps)
COPY --from=php-deps /app/vendor ./vendor

# Regenerate autoload + package discovery
# package:discover menulis bootstrap/cache/packages.php dari package yang
# ter-install di image ini. Wajib supaya image bisa jalan di production
# tanpa override (bind mount bootstrap/ hanya ada di development).
RUN composer dump-autoload --optimize --no-interaction \
    && php artisan package:discover --ansi

# Directory Permissions
# Laravel butuh write access ke storage/ dan bootstrap/cache/
RUN chown -R www-data:www-data /var/www/html/storage \
    /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage \
    /var/www/html/bootstrap/cache

#  Copy Supervisor Config
# Lokasi default: /etc/supervisord.conf → supervisorctl langsung kerja tanpa -c
COPY docker/supervisor/supervisord.conf /etc/supervisord.conf

# Copy Entrypoint Script
COPY docker/scripts/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose PHP-FPM Port
EXPOSE 9000

# Healthcheck (opsional — cek apakah PHP-FPM masih merespons)
# Healthcheck ini hanya meaningful jika dipakai di orchestration (mis. Kubernetes
# readiness probe). Di Docker Compose, healthcheck bisa ditambahkan dengan:
#   healthcheck:
#     test: ["CMD", "php-fpm-healthcheck"]
# Tapi PHP-FPM di Alpine tidak punya healthcheck built-in.
# Opsional: uncomment jika orchestration memakainya.
# HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
#     CMD php -r 'exit extension_loaded("pdo_mysql") ? 0 : 1;'

# Entrypoint & Command
ENTRYPOINT ["entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisord.conf", "-n"]
