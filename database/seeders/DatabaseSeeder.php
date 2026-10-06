<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Event;
use App\Models\Leader;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create 4 Role Users
        $operator = User::updateOrCreate(
            ['email' => 'daskrimti.kejatijabar@gmail.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'role' => 'operator',
                'email_verified_at' => now(),
            ]
        );

        $protokol = User::updateOrCreate(
            ['email' => 'protokol@kejati.go.id'],
            [
                'name' => 'Tim Protokol',
                'password' => Hash::make('password'),
                'role' => 'protokol',
                'email_verified_at' => now(),
                'reminder_hours' => ['24'],
            ]
        );

        $kajati = User::updateOrCreate(
            ['email' => 'kajati@kejati.go.id'],
            [
                'name' => 'Kepala Kejaksaan Tinggi',
                'password' => Hash::make('password'),
                'role' => 'kajati',
                'email_verified_at' => now(),
                'reminder_hours' => ['24'],
            ]
        );

        $wakajati = User::updateOrCreate(
            ['email' => 'wakajati@kejati.go.id'],
            [
                'name' => 'Wakil Kepala Kejaksaan Tinggi',
                'password' => Hash::make('password'),
                'role' => 'wakajati',
                'email_verified_at' => now(),
                'reminder_hours' => ['24'],
            ]
        );

        // 2. Create Leaders
        $leaderKajati = Leader::firstOrCreate(
            ['position' => 'Kajati'],
            [
                'name' => 'Dr. RD Mohammad Teguh Darmawan, S.H., M.H',
                'nip' => '197001011995031001',
                'email' => 'kajati@kejati.go.id',
                'phone' => '081234567890',
                'is_active' => true,
            ]
        );

        $leaderWakajati = Leader::firstOrCreate(
            ['position' => 'Wakajati'],
            [
                'name' => 'Dr. Desy Meutia Firdaus, S.H., M.Hum',
                'nip' => '197205121997031002',
                'email' => 'wakajati@kejati.go.id',
                'phone' => '081234567891',
                'is_active' => true,
            ]
        );

        // 3. Create Rooms (mencakup lantai 1-8, idempotent by name)
        $rooms = [
            ['Aula Utama Kejati', 'Gedung Utama Lt. 1', 200, 'Aula serbaguna untuk upacara dan pelantikan'],
            ['Ruang Audiensi', 'Gedung Utama Lt. 1', 15, 'Ruang penerimaan tamu pimpinan'],
            ['Ruang Rapat Pimpinan', 'Gedung Utama Lt. 2', 30, 'Ruang rapat khusus pimpinan dan staf ahli'],
            ['Ruang Rapat Koordinasi', 'Gedung Utama Lt. 3', 40, 'Ruang rapat koordinasi lintas bidang'],
            ['Ruang Media Center', 'Gedung Utama Lt. 4', 20, 'Ruang konferensi pers dan pengelolaan media'],
            ['Ruang Gelar Perkara', 'Gedung Utama Lt. 5', 25, 'Ruang ekspose dan gelar perkara'],
            ['Ruang Diklat', 'Gedung Utama Lt. 6', 50, 'Ruang pelatihan dan peningkatan kapasitas'],
            ['Ruang Command Center', 'Gedung Utama Lt. 7', 20, 'Ruang pemantauan dan komando'],
            ['Ruang Pertemuan Terbatas', 'Gedung Utama Lt. 8', 12, 'Ruang pertemuan terbatas pimpinan'],
        ];

        foreach ($rooms as [$name, $location, $capacity, $description]) {
            Room::firstOrCreate(
                ['name' => $name],
                ['location' => $location, 'capacity' => $capacity, 'description' => $description, 'is_active' => true]
            );
        }

        $roomRapim = Room::where('name', 'Ruang Rapat Pimpinan')->firstOrFail();

        // 4. Create Categories (7 kategori, idempotent by name)
        $categories = [
            ['Rapat Internal', '#008752', 'Rapat koordinasi dan evaluasi internal'],
            ['Audiensi', '#3B82F6', 'Penerimaan kunjungan dan pemangku kepentingan'],
            ['Kunjungan Kerja', '#F59E0B', 'Kunjungan dinas ke Kejari atau instansi luar'],
            ['Upacara / Seremonial', '#8B5CF6', 'Kegiatan seremonial danperingatan hari besar'],
            ['Bimbingan Teknis', '#0EA5E9', 'Pelatihan teknis dan peningkatan kapasitas jaksa'],
            ['Penerangan Hukum', '#10B981', 'Penyuluhan dan penerangan hukum kepada masyarakat'],
            ['Rapat Evaluasi', '#EF4444', 'Evaluasi capaian kinerja dan tindak lanjut'],
        ];

        foreach ($categories as [$name, $color, $description]) {
            Category::firstOrCreate(
                ['name' => $name],
                ['color' => $color, 'description' => $description]
            );
        }

        $catRapat = Category::where('name', 'Rapat Internal')->firstOrFail();
        $catAudiensi = Category::where('name', 'Audiensi')->firstOrFail();

        // 5. Create Sample Events
        Event::firstOrCreate(
            ['title' => 'Rapat Evaluasi Kinerja Bulanan Pimpinan'],
            [
                'description' => 'Membahas capaian kinerja triwulan dan agenda strategis Kejati.',
                'leader_id' => $leaderKajati->id,
                'room_id' => $roomRapim->id,
                'category_id' => $catRapat->id,
                'start_time' => Carbon::now(config('app.timezone'))->addHours(2),
                'end_time' => Carbon::now(config('app.timezone'))->addHours(4),
                'dress_code' => 'Pakaian Dinas Harian (PDH)',
                'participants' => 'Kajati, Wakajati, Para Asisten, dan Koordinator',
                'status' => 'scheduled',
                'created_by' => $protokol->id,
            ]
        );

        Event::firstOrCreate(
            ['title' => 'Audiensi dengan Forkopimda Daerah'],
            [
                'description' => 'Silaturahmi dan pemantapan koordinasi kelembagaan.',
                'leader_id' => $leaderWakajati->id,
                'room_id' => Room::where('name', 'Ruang Audiensi')->firstOrFail()->id,
                'category_id' => $catAudiensi->id,
                'start_time' => Carbon::tomorrow()->setTime(10, 0),
                'end_time' => Carbon::tomorrow()->setTime(12, 0),
                'dress_code' => 'Batik Motif Daerah',
                'participants' => 'Wakajati & Asisten Intelijen',
                'status' => 'scheduled',
                'created_by' => $protokol->id,
            ]
        );

        // 6. Data dummy agenda (100 baris, awalan judul "[DUMMY]").
        // Khusus non-production agar seeding production tetap bersih.
        if (app()->isLocal()) {
            $this->call(AgendaDummySeeder::class);
        }
    }
}
