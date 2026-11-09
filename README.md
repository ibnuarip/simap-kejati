<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

# SIMAP Kejaksaan Tinggi Jawa Barat

![CI Status](https://github.com/ibnuarip/simap-kejati/actions/workflows/ci.yml/badge.svg)
![PHP Version](https://img.shields.io/badge/PHP-8.4-777BB4.svg?logo=php)
![Laravel](https://img.shields.io/badge/Laravel-FF2D20.svg?logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Docker](https://img.shields.io/badge/Docker-2496ED.svg?logo=docker&logoColor=white)

Sistem Informasi Manajemen Agenda Pimpinan untuk Kejaksaan Tinggi Jawa Barat. Mengelola jadwal kegiatan pimpinan secara terpusat, mulai dari pencatatan agenda, deteksi bentrok jadwal, notifikasi pengingat, hingga pelaporan.

## Fungsi Aplikasi

| Peran            | Fungsi                                                                                                                  |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Superadmin**   | Mengelola seluruh sistem: master data, pengguna, agenda, kalender, serta cetak & ekspor laporan.                        |
| **Tim Protokol** | Mengelola agenda pimpinan yang ditugaskan, deteksi bentrok jadwal, kalender, cetak & ekspor, dan pengaturan notifikasi. |
| **Pimpinan**     | Melihat ringkasan agenda, kalender jadwal, dan pengaturan notifikasi.                                                   |

## Fitur-fitur

- **Manajemen Agenda** input, ubah, dan batalkan agenda dengan status lengkap; deteksi bentrok jadwal otomatis; kalender interaktif; pencarian, filter, dan paginasi.
- **Master Data** kelola data pimpinan, ruangan & tempat, serta kategori kegiatan.
- **Kelola Pengguna** pembuatan dan pengaturan akun beserta perannya (registrasi publik nonaktif).
- **Dashboard Analitik** statistik sistem, tren aktivitas agenda bulanan, distribusi kategori, ringkasan status agenda, dan agenda mendatang.
- **Cetak & Ekspor** cetak/simpan PDF berkop surat (A4), ekspor Excel dan CSV, periode harian hingga tahunan atau rentang kustom.
- **Notifikasi** pengingat agenda via push notification dengan jam pengingat yang dapat diatur.
- **Keamanan** autentikasi lengkap (login, verifikasi email, two-factor authentication, passkey), profil pengguna, tema tampilan, dan akses berbasis peran.

## Teknologi

- **Backend:** Laravel (PHP 8.4)
- **Frontend:** React, Inertia.js, TypeScript
- **Styling:** Tailwind CSS, Radix UI
- **Database:** MySQL 8.4
- **Cache & Queue:** Redis 7
- **Testing & Quality:** Pest, PHPStan, Laravel Pint
- **Infrastructure:** Docker & Docker Compose (Nginx, PHP-FPM)

## Cara Instalasi

**1. Clone repository**

```bash
git clone https://github.com/ibnuarip/simap-kejati.git
cd simap-kejati
```

**2. Siapkan environment**

```bash
cp .env.example .env
cp .env.example .env.docker
```

**3. Generate kredensial keamanan (`APP_KEY` & `VAPID_*`)**

```bash
# Generate APP_KEY baru
php artisan key:generate --show

# Generate pasangan kunci VAPID Web Push baru
node -e "const c=require('crypto').createECDH('prime256v1');c.generateKeys();console.log('VAPID_PUBLIC_KEY='+c.getPublicKey().toString('base64url'));console.log('VAPID_PRIVATE_KEY='+Buffer.concat([Buffer.alloc(32-c.getPrivateKey().length),c.getPrivateKey()]).toString('base64url'));"
```
Salin nilai `APP_KEY`, `VAPID_PUBLIC_KEY`, dan `VAPID_PRIVATE_KEY` yang dihasilkan ke dalam file `.env` dan `.env.docker`.

---

## Cara Menjalankan

### Opsi A: Menggunakan Docker Compose

Prasyarat: [Docker Desktop](https://www.docker.com/products/docker-desktop/) atau Docker Engine + Docker Compose.

```bash
# Build & nyalakan seluruh layanan (app, nginx, mysql, redis, node)
docker compose up -d --build
```

Aplikasi dapat diakses di **`http://localhost:8080`**.

Perintah utilitas Docker yang sering digunakan:

```bash
docker compose ps                                      # cek status container
docker compose logs -f app node                        # pantau log aplikasi & frontend
docker compose down                                    # matikan seluruh container
docker compose down -v                                 # matikan container & hapus volume data
docker compose exec app php artisan migrate:fresh --seed # reset database & jalankan seeder
docker compose exec app php artisan optimize:clear     # bersihkan seluruh cache Laravel
docker compose exec node npm run build                 # kompilasi aset frontend secara manual
```

### Opsi B: Menggunakan Laragon / Lokal (Native)

Prasyarat: PHP 8.4, Composer, Node.js 22+, dan MySQL 8+.

```bash
# 1. Instal dependensi backend & frontend
composer install
npm install

# 2. Migrasi database, seeder, & symlink storage
php artisan migrate --seed
php artisan storage:link

# 3. Kompilasi aset frontend (untuk production)
npm run build
```

Untuk menjalankan server pengembangan secara lokal (server PHP, queue worker, dan Vite HMR sekaligus):

```bash
composer run dev
```

Atau jalankan worker dan scheduler secara terpisah pada mode production di Laragon:

```bash
php artisan queue:work --tries=3
php artisan schedule:work
```

---

## Pengembangan & Kualitas Kode

Pastikan perubahan kode lolos pemeriksaan berikut sebelum melakukan commit/push (CI akan menjalankannya secara otomatis):

```bash
vendor/bin/pint              # format kode PHP (Laravel Pint)
composer types:check         # analisis statis PHP (PHPStan)
php artisan test --compact   # unit & feature test (Pest)
npm run check                # lint & format frontend
npm run types:check          # validasi tipe TypeScript
```
