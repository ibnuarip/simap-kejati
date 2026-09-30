#!/bin/sh
# entrypoint.sh — Script yang jalan otomatis saat container START
# Script ini dijalankan SEBELUM PHP-FPM/Supervisor dimulai.
# Fungsinya:
#   1. Memastikan directory & permission benar
#   2. Validasi APP_KEY
#   3. Cache config/route/view untuk performa
#   4. Jalankan database migration
#   5. Seed data awal (hanya kalau database masih kosong)
#   6. Buat storage link (public/storage -> storage/app/public)
#
# Catatan: Script ini idempotent (aman dijalankan berulang kali)

set -e  # Berhenti jika ada error (fail-fast)

echo "=================================================="
echo "  SIMAP Kejati — Container Starting..."
echo "=================================================="

# 1. Buat directory yang diperlukan
# Laravel membutuhkan beberapa folder untuk menyimpan file temporary
echo "[1/7] Membuat directory yang diperlukan..."
mkdir -p /var/www/html/storage/framework/cache
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/storage/app/public
mkdir -p /var/www/html/bootstrap/cache
mkdir -p /var/log/php
mkdir -p /var/log/supervisor

# 2. Set permissions
# www-data = user yang menjalankan PHP-FPM (harus punya write access)
echo "[2/7] Setting permissions..."
chown -R www-data:www-data /var/www/html/storage
chown -R www-data:www-data /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage
chmod -R 775 /var/www/html/bootstrap/cache
chown -R www-data:www-data /var/log/php

# 3. Validasi APP_KEY
# APP_KEY dipakai untuk enkripsi (session, password, dll)
# CATATAN: file .env TIDAK ada di dalam image (lihat .dockerignore), jadi
# `artisan key:generate` tidak bisa dipakai di sini. Kuncinya harus berasal
# dari environment variable yang di-pass lewat .env.docker.
echo "[3/7] Mengecek APP_KEY..."
case "$APP_KEY" in
    base64:*)
        echo "     → APP_KEY sudah ada ✓"
        ;;
    "")
        echo "ERROR: APP_KEY kosong di .env.docker — container tidak bisa start." >&2
        echo "       Generate key di host dengan:" >&2
        echo "         php artisan key:generate --show" >&2
        echo "       lalu paste hasilnya ke baris APP_KEY= di .env.docker" >&2
        exit 1
        ;;
    *)
        # Contoh nilainya "# Generate dengan ..." — tanda ada komentar inline
        # di .env.docker yang ikut terbaca sebagai nilai.
        echo "ERROR: APP_KEY tidak valid (harus diawali 'base64:')." >&2
        echo "       Nilai yang terbaca: $APP_KEY" >&2
        echo "       Perbaiki baris APP_KEY= di .env.docker (tanpa komentar" >&2
        echo "       di belakang nilai)." >&2
        exit 1
        ;;
esac

# 4. Cache config, routes, dan views
# Di production: caching membuat Laravel jauh lebih cepat.
# Di local/development: cache dibersihkan agar perubahan file/route real-time aktif tanpa restart.
if [ "$APP_ENV" = "production" ]; then
    echo "[4/7] Caching configuration (production mode)..."
    php artisan config:cache
    php artisan route:cache || echo "     → route:cache dilewati (ada route yang tidak bisa di-cache)"
    php artisan view:cache       # Compile semua Blade template
    php artisan event:cache      # Cache event-listener mapping
else
    echo "[4/7] Mode development ($APP_ENV): membersihkan stale cache..."
    php artisan config:clear
    php artisan route:clear
    php artisan view:clear
    php artisan event:clear
fi

# 5. Database Migration
# --force = jalankan tanpa konfirmasi (wajib untuk non-interactive/Docker)
echo "[5/7] Running database migrations..."
php artisan migrate --force
echo "     → Migration selesai ✓"

# 6. Seed data awal
# Wajib: tanpa user di database, halaman login selalu membalas
# "These credentials do not match our records" untuk email APAPUN.
#
# Seeder memakai updateOrCreate()/firstOrCreate() jadi aman diulang, tapi tetap
# hanya dijalankan saat tabel user masih kosong. Kalau tidak, user yang
# sengaja dihapus akan muncul lagi setiap container di-restart.
echo "[6/7] Mengecek data awal..."
USER_COUNT="$(php artisan tinker --execute='echo App\Models\User::count();' 2>/dev/null | tr -cd '0-9')"

if [ -z "$USER_COUNT" ]; then
    echo "     → Gagal menghitung user, seeder dilewati"
    echo "       (cek koneksi database: docker compose logs mysql)"
elif [ "$USER_COUNT" -eq 0 ]; then
    echo "     → Database kosong, menjalankan seeder..."
    php artisan db:seed --force
    echo "     → Seeder selesai ✓"
    echo ""
    echo "     Login pakai salah satu akun berikut (password: password):"
    echo "       operator@kejati.go.id  → dashboard operator"
    echo "       protokol@kejati.go.id  → dashboard protokol"
    echo "       kajati@kejati.go.id    → dashboard kajati"
    echo "       wakajati@kejati.go.id  → dashboard wakajati"
else
    echo "     → Database sudah berisi data ($USER_COUNT user), seeder dilewati ✓"
fi

# 7. Storage Link
# Buat symlink: public/storage -> storage/app/public
# supaya file yang di-upload bisa diakses via URL /storage/...
# Catatan: symlink sering GAGAL dibuat di atas bind mount Windows (Docker
# Desktop), itu kenapa errornya diabaikan. Nginx tetap bisa melayani
# /storage/... langsung dari volume storage (lihat docker/nginx/default.conf).
echo "[7/7] Creating storage link..."
php artisan storage:link --force 2>/dev/null || echo "     → symlink dilewati, Nginx serve /storage/ langsung dari volume"
echo "     → Storage siap ✓"

echo "=================================================="
echo "  SIMAP Kejati — Ready! 🚀"
echo "=================================================="

# Jalankan CMD (Supervisor)
# exec "$@" menggantikan process entrypoint dengan CMD dari Dockerfile
# Ini PENTING supaya signal (SIGTERM, dll) diterima oleh Supervisor
exec "$@"
