#!/bin/sh
# entrypoint.sh — Script startup container

set -e

echo "=================================================="
echo "  SIMAP Kejati — Container Starting..."
echo "=================================================="

# 1. Directory & Permissions
echo "[1/6] Menyiapkan directory & permissions..."
mkdir -p /var/www/html/storage/framework/cache
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/storage/app/public
mkdir -p /var/www/html/bootstrap/cache
mkdir -p /var/log/php
mkdir -p /var/log/supervisor

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/log/php
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# 2. Validasi APP_KEY
echo "[2/6] Mengecek APP_KEY..."
case "$APP_KEY" in
    base64:*)
        echo "     → APP_KEY sudah ada ✓"
        ;;
    "")
        echo "ERROR: APP_KEY kosong di .env.docker." >&2
        exit 1
        ;;
    *)
        echo "ERROR: APP_KEY tidak valid (harus diawali 'base64:')." >&2
        exit 1
        ;;
esac

# 3. Cache Management
if [ "$APP_ENV" = "production" ]; then
    echo "[3/6] Caching configuration (production mode)..."
    php artisan config:cache
    php artisan route:cache || true
    php artisan view:cache
    php artisan event:cache
else
    echo "[3/6] Membersihkan cache (development mode)..."
    php artisan config:clear
    php artisan route:clear
    php artisan view:clear
    php artisan event:clear
fi

# 4. Database Migration
echo "[4/6] Running database migrations..."
php artisan migrate --force
echo "     → Migration selesai ✓"

# 5. Seed Data Awal
echo "[5/6] Mengecek data awal..."
USER_COUNT="$(php artisan tinker --execute='echo App\Models\User::count();' 2>/dev/null | tr -cd '0-9')"

if [ -z "$USER_COUNT" ]; then
    echo "     → Gagal menghitung user, seeder dilewati"
elif [ "$USER_COUNT" -eq 0 ]; then
    echo "     → Menjalankan seeder..."
    php artisan db:seed --force
    echo "     → Seeder selesai ✓"
else
    echo "     → Database sudah berisi data, seeder dilewati ✓"
fi

# 6. Storage Link
echo "[6/6] Creating storage link..."
php artisan storage:link --force 2>/dev/null || echo "     → symlink dilewati"
echo "     → Storage siap ✓"

echo "=================================================="
echo "  SIMAP Kejati — Ready! 🚀"
echo "=================================================="

exec "$@"
