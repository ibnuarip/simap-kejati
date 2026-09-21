Product Requirements Document (PRD)

**Nama Produk:** SIMAP (Sistem Informasi Manajemen Agenda Pimpinan)
**Tech Stack Rencana:** Backend (Laravel), Frontend (React), Database (MySQL)
Status: Draft Perencanaan (V1.0)

# SECTION 1: Problem Statement

Manajemen agenda pimpinan (Ketua Kejati & Wakil Kejati) sering kali menghadapi tantangan koordinasi dan jadwal bentrok jika masih dikelola secara manual atau tidak terpusat.

**Permasalahan:**

- **Kurangnya Visibilitas Pimpinan:** Pimpinan membutuhkan akses cepat untuk melihat jadwal harian/bulanan tanpa harus selalu meminta laporan cetak atau menanyakan langsung ke staf.
- **Risiko Missed Schedule:** Pimpinan dengan mobilitas tinggi berisiko melewatkan agenda penting jika tidak ada sistem notifikasi/pengingat otomatis.
- **Koordinasi Multi-Protokol:** Tim Protokol yang terdiri dari beberapa personel membutuhkan satu wadah terpusat untuk menginput dan memutakhirkan jadwal secara real-time tanpa konflik data.

# SECTION 2: Goals

Tujuan dan Metrik Kesuksesan:

- **G1 (Efisiensi Akses Agenda):** Pimpinan dapat melihat seluruh agenda harian/mingguan dalam < 3 klik melalui device mereka.
- **G2 (Pengurangan Kelewatan Agenda):** 0% agenda pimpinan terlewat akibat keterlambatan informasi, berkat adanya notifikasi email reminder.
- **G3 (Sinkronisasi Tim Protokol):** Data agenda tersinkronisasi secara real-time ketika diinput oleh personel Protokol.
- **G4 (Kecepatan Respon Sistem):** Halaman kalender dan daftar agenda memuat data dalam waktu < 500 ms.

# SECTION 3: Target Users / Personas

Deskripsi dan Hak Akses Pengguna:

- **Ketua Kejati (Viewer):** Pimpinan utama institusi. Hanya memiliki akses baca/melihat agenda. Kebutuhan utama: Melihat kalender agenda dengan cepat, pencarian agenda, serta menerima pengingat otomatis via email.
- **Wakil Kejati (Viewer):** Pimpinan pendamping. Hanya memiliki akses baca/melihat agenda. Kebutuhan utama: Melihat kalender agenda pimpinan serta menerima pengingat otomatis via email.
- **Protokol (Editor - Multiple Users):** Tim lapangan yang mengelola jadwal dan mendampingi pimpinan. Kebutuhan utama: Menginput, mengubah, membatalkan, dan mengatur pimpinan/peserta kegiatan.
- **Operator (Admin / Master Control):** Administrator sistem/IT. Kebutuhan utama: Mengelola data pengguna (CRUD user/role), mengelola master data (ruangan, jenis kegiatan), dan akses CRUD penuh ke seluruh agenda.

# SECTION 4: User Stories

Diurutkan berdasarkan prioritas:

- **US-1 (P1):** Sebagai Ketua Kejati, saya ingin login dan melihat tampilan kalender agenda agar dapat mengetahui jadwal kegiatan saya hari ini dan mendatang.
- US-2 (P1): Sebagai Ketua Kejati, saya ingin menerima notifikasi email pengingat sebelum kegiatan dimulai agar dapat bersiap tepat waktu.
- US-3 (P1): Sebagai Wakil Kejati, saya ingin login dan melihat tampilan kalender agenda agar dapat mengetahui jadwal kegiatan saya hari ini dan mendatang.
- US-4 (P1): Sebagai Wakil Kejati, saya ingin menerima notifikasi email pengingat sebelum kegiatan dimulai agar dapat bersiap tepat waktu.
- US-5 (P1): Sebagai Protokol, saya ingin menambah dan merubah jadwal agenda pimpinan agar informasi kegiatan selalu up-to-date.
- US-6 (P1): Sebagai Protokol, saya ingin menentukan siapa pimpinan yang hadir dan peserta kegiatan agar penugasan jelas.
- US-7 (P2): Sebagai Protokol, saya ingin mencetak agenda harian atau mengunduh rekap bulanan untuk keperluan arsip/laporan fisik.
- US-8 (P1): Sebagai Operator, saya ingin mengelola master data (pimpinan, ruangan/tempat, jenis kegiatan) agar data acuan terstruktur.
- US-9 (P1): Sebagai Operator, saya ingin mengatur akun dan hak akses pengguna agar keamanan sistem terjaga.

# SECTION 5: Functional Requirements

| ID    | Fitur                   | Deskripsi                                                                        | Prioritas |
| ----- | ----------------------- | -------------------------------------------------------------------------------- | --------- |
| FR-01 | Tampilan Kalender       | Menampilkan agenda dalam format tampilan bulanan, mingguan, dan harian.          | P1        |
| FR-02 | Detail Agenda           | Menampilkan rincian acara (waktu, tempat, pimpinan, pakaian/dresscode, peserta). | P1        |
| FR-03 | Pencarian & Filter      | Filter agenda berdasarkan pimpinan, rentang tanggal, atau jenis kegiatan.        | P1        |
| FR-04 | CRUD Agenda             | Penginputan detail kegiatan oleh Protokol dan Operator.                          | P1        |
| FR-05 | Atur Pimpinan & Peserta | Memilih pimpinan yang bertugas serta mencatat daftar peserta/pendamping.         | P1        |
| FR-06 | Email Ke Pimpinan       | Pengiriman email reminder otomatis ke email Ketua & Wakil Kejati.                | P1        |
| FR-07 | Pengaturan Pengingat    | Pengaturan waktu pengiriman pengingat dan pemilihan target penerima email.       | P2        |
| FR-08 | Cetak & Ekspor          | Cetak agenda harian, unduh rekap bulanan (PDF/Excel), format siap tanda tangan.  | P2        |
| FR-09 | Kelola Pengguna         | Daftar pengguna, aktivasi akun, dan pengaturan peran (RBAC 4 Role).              | P1        |
| FR-10 | Master Data             | Pengelolaan Data Pimpinan, Ruangan & Tempat, serta Jenis/Kategori Kegiatan.      | P1        |
| FR-11 | Masuk & Keamanan        | Login, Reset Password via email, dan Logout.                                     | P1        |

# SECTION 6: Non-Functional Requirements

1. **NFR-1 (P1) Performa Interface:** Tampilan React responsif, render kalender dan data agenda < 300 ms.
2. **NFR-2 (P1) Email Delivery (Laravel Queue):** Pengiriman email notifikasi menggunakan background job/queue agar tidak memperlambat respon aplikasi saat simpan data.
3. **NFR-3 (P1) Mobile Friendly:** UI/UX dioptimalkan untuk tampilan smartphone/tablet (terutama untuk tampilan Ketua & Wakil Kejati).
4. **NFR-4 (P1) Keamanan:** Penggunaan Laravel Sanctum / Session-based auth untuk membatasi akses endpoint API sesuai role.
5. **NFR-5 (P1) Ketersediaan (Uptime):** Minimal 99% uptime untuk memastikan Pimpinan dapat mengakses kalender kapan saja.

# SECTION 7: Scope (In/Out)

## In Scope (Rilis V1.0)

- Implementasi 5 Fase Fitur sesuai peta konsep (Kalender, Kelola Agenda, Pengingat Email, Cetak/Ekspor, Kelola User & Master Data, Authentication).
- Penerapan Role-Based Access Control (RBAC) untuk 4 Role: Ketua Kejati, Wakil Kejati, Protokol, Operator.
- Fitur Email Notification/Reminder otomatis ke akun email pimpinan.
- Ekspor dokumen agenda harian/bulanan ke format PDF siap cetak.

## Out of Scope (Ditunda ke Rilis Selanjutnya)

- Notifikasi via WhatsApp Gateway / Push Notification Mobile App (Saat ini berfokus ke Email).
- Aplikasi Mobile Native (iOS/Android) — menggunakan Web Responsif PWA lebih dahulu.
- Integrasi otomatis ke Google Calendar / Outlook Calendar pimpinan.
