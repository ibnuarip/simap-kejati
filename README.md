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

Prasyarat: [Docker Desktop](https://www.docker.com/products/docker-desktop/), [Git](https://git-scm.com/), dan `make` (tersedia via Git Bash, Chocolatey, atau Scoop di Windows).

**1. Clone repository**

```bash
git clone https://github.com/ibnuarip/simap-kejati.git
cd simap-kejati
```

**2. Siapkan environment**

```bash
cp .env.example .env
cp .env.docker.example .env.docker
```

**3. Build container**

```bash
make build
```

**4. Instalasi dependensi & database**

```bash
make composer-install   # dependensi backend
make key                # application key
make storage            # storage link
make fresh              # migrasi + seed
make npm-install        # dependensi frontend
make npm-build          # kompilasi aset
```

## Cara Menjalankan

```bash
make up                 # nyalakan seluruh layanan
```

Aplikasi dapat diakses di **`http://localhost:8080`**.

Untuk pengembangan frontend dengan _Hot Module Replacement_:

```bash
make npm-dev
```

Perintah lain seperti `make down`, `make logs`, `make artisan cmd="..."`, dan `make tinker` tersedia di `Makefile`.

## Pengembangan

Pastikan perubahan kode lolos pemeriksaan berikut sebelum push CI akan menjalankannya kembali secara otomatis:

```bash
make format      # format kode PHP (Pint)
make types       # analisis statis (PHPStan)
make test-pest   # unit & feature test (Pest)
make npm-types   # validasi TypeScript
```
