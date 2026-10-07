<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

# SIMAP Kejaksaan Tinggi Jawa Barat

![CI Status](https://github.com/ibnuarip/simap-kejati/actions/workflows/ci.yml/badge.svg)
![PHP Version](https://img.shields.io/badge/PHP-8.4-777BB4.svg?logo=php)
![Laravel](https://img.shields.io/badge/Laravel-FF2D20.svg?logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Docker](https://img.shields.io/badge/Docker-2496ED.svg?logo=docker&logoColor=white)

Sistem Informasi Manajemen Terpadu untuk Kejaksaan Tinggi (Kejati) Jawa Barat. Aplikasi ini dibangun dengan standar teknologi modern menggunakan arsitektur Monolith berbasis Inertia.js.

## Tech Stack

- **Backend:** Laravel (PHP 8.4)
- **Frontend:** React, Inertia.js, TypeScript
- **Styling:** Tailwind CSS, Radix UI
- **Database:** MySQL 8.4
- **Cache & Queue:** Redis 7
- **Testing & Quality:** Pest, PHPStan, Laravel Pint
- **Infrastructure:** Docker & Docker Compose (Nginx, PHP-FPM)

---

## Prerequisites

Proyek ini sepenuhnya beroperasi menggunakan lingkungan terisolasi (Docker). Pastikan sistem Anda telah memiliki perangkat lunak berikut:

1. [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac) atau Docker Engine (Linux).
2. [Git](https://git-scm.com/).
3. Akses ke terminal `make` (tersedia via Git Bash, Chocolatey, atau Scoop pada sistem operasi Windows).

---

## Installation

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi pada lingkungan lokal Anda:

### 1. Clone Repository

```bash
git clone https://github.com/ibnuarip/simap-kejati.git
cd simap-kejati
```

### 2. Environment Configuration

Gandakan file konfigurasi `.env` dan sesuaikan kredensial di dalamnya apabila diperlukan.

```bash
cp .env.example .env
cp .env.docker.example .env.docker
```

### 3. Start Container

Aplikasi menggunakan `Makefile` untuk manajemen Docker yang efisien. Jalankan perintah berikut untuk menginisialisasi server:

```bash
make build
```

### 4. Setup Dependencies & Database

Setelah container aktif, jalankan serangkaian perintah berikut untuk menyiapkan inti aplikasi:

```bash
# Instalasi dependensi backend
make composer-install

# Konfigurasi aplikasi
make key
make storage

# Migrasi dan inisialisasi basis data
make fresh

# Instalasi dan kompilasi dependensi frontend
make npm-install
make npm-build
```

Aplikasi kini dapat diakses melalui peramban pada alamat: **`http://localhost:8080`**

---

## Development Workflow

Proyek ini menggunakan _Hot Module Replacement_ (HMR) untuk efisiensi penulisan kode antar-muka. Untuk mengaktifkan sinkronisasi otomatis, jalankan _development server_:

```bash
make npm-dev
```

### Command Reference (Makefile)

Gunakan pintasan berikut untuk berinteraksi dengan layanan Docker tanpa mengetik instruksi panjang:

| Command                     | Description                                                              |
| --------------------------- | ------------------------------------------------------------------------ |
| `make up` / `make down`     | Menyalakan / mematikan layanan aplikasi                                  |
| `make bash`                 | Mengakses _shell_ pada container Laravel (PHP)                           |
| `make bash-node`            | Mengakses _shell_ pada container Node (Vite/Frontend)                    |
| `make bash-db`              | Mengakses terminal sesi MySQL                                            |
| `make artisan cmd="..."`    | Menjalankan perintah artisan, misal `make artisan cmd="make:model User"` |
| `make tinker`               | Membuka antarmuka interaktif Laravel Tinker                              |
| `make clear` / `make cache` | Membersihkan atau menyusun ulang _cache_ aplikasi                        |

---

## Code Quality & Testing

Seluruh kontribusi kode diwajibkan untuk melewati standar validasi. GitHub Actions akan otomatis menolak integrasi kode apabila terjadi kegagalan pada pengujian berikut:

```bash
# Merapikan gaya penulisan kode PHP (Pint)
make format

# Analisis statis logika PHP (PHPStan)
make types

# Eksekusi unit test dan feature test (Pest)
make test-pest

# Validasi kompilasi TypeScript
make npm-types
```

Disarankan untuk menjalankan pengujian di atas pada lokal komputer Anda sebelum melakukan `git push`.

---

## Security

Repositori ini secara ketat dimonitor oleh **Dependabot** guna memastikan keamanan seluruh dependensi paket. Apabila Anda menemukan kelemahan keamanan (_security vulnerability_), harap melaporkannya langsung kepada pengelola repositori dan tidak melalui isu publik (_public tracker_).
