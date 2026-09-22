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
            ['email' => 'operator@kejati.go.id'],
            [
                'name' => 'Operator Admin',
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
            ]
        );

        $kajati = User::updateOrCreate(
            ['email' => 'kajati@kejati.go.id'],
            [
                'name' => 'Kepala Kejaksaan Tinggi (Kajati)',
                'password' => Hash::make('password'),
                'role' => 'kajati',
                'email_verified_at' => now(),
            ]
        );

        $wakajati = User::updateOrCreate(
            ['email' => 'wakajati@kejati.go.id'],
            [
                'name' => 'Wakil Kepala Kejaksaan Tinggi (Wakajati)',
                'password' => Hash::make('password'),
                'role' => 'wakajati',
                'email_verified_at' => now(),
            ]
        );

        // 2. Create Leaders
        $leaderKajati = Leader::firstOrCreate(
            ['position' => 'Kajati'],
            [
                'name' => 'Dr. H. Ahmad Fauzi, S.H., M.H.',
                'nip' => '19700101 199503 1 001',
                'email' => 'kajati@kejati.go.id',
                'phone' => '081234567890',
                'is_active' => true,
            ]
        );

        $leaderWakajati = Leader::firstOrCreate(
            ['position' => 'Wakajati'],
            [
                'name' => 'Bambang Supriyadi, S.H., M.H.',
                'nip' => '19720512 199703 1 002',
                'email' => 'wakajati@kejati.go.id',
                'phone' => '081234567891',
                'is_active' => true,
            ]
        );

        // 3. Create Rooms
        $roomAula = Room::firstOrCreate(
            ['name' => 'Aula Utama Kejati'],
            [
                'location' => 'Gedung Utama Lt. 1',
                'capacity' => 200,
                'description' => 'Aula serbaguna untuk upacara dan pelantikan',
                'is_active' => true,
            ]
        );

        $roomRapim = Room::firstOrCreate(
            ['name' => 'Ruang Rapat Pimpinan'],
            [
                'location' => 'Gedung Utama Lt. 2',
                'capacity' => 30,
                'description' => 'Ruang rapat khusus pimpinan dan staf ahli',
                'is_active' => true,
            ]
        );

        $roomAudiensi = Room::firstOrCreate(
            ['name' => 'Ruang Audiensi'],
            [
                'location' => 'Gedung Utama Lt. 1',
                'capacity' => 15,
                'description' => 'Ruang penerimaan tamu pimpinan',
                'is_active' => true,
            ]
        );

        // 4. Create Categories
        $catRapat = Category::firstOrCreate(
            ['name' => 'Rapat Internal'],
            ['color' => '#008752', 'description' => 'Rapat koordinasi dan evaluasi internal']
        );

        $catAudiensi = Category::firstOrCreate(
            ['name' => 'Audiensi'],
            ['color' => '#3B82F6', 'description' => 'Penerimaan kunjungan dan pemangku kepentingan']
        );

        $catKunker = Category::firstOrCreate(
            ['name' => 'Kunjungan Kerja'],
            ['color' => '#F59E0B', 'description' => 'Kunjungan dinas ke Kejari atau instansi luar']
        );

        $catUpacara = Category::firstOrCreate(
            ['name' => 'Upacara / Seremonial'],
            ['color' => '#8B5CF6', 'description' => 'Kegiatan seremonial danperingatan hari besar']
        );

        // 5. Create Sample Events
        Event::firstOrCreate(
            ['title' => 'Rapat Evaluasi Kinerja Bulanan Pimpinan'],
            [
                'description' => 'Membahas capaian kinerja triwulan dan agenda strategis Kejati.',
                'leader_id' => $leaderKajati->id,
                'room_id' => $roomRapim->id,
                'category_id' => $catRapat->id,
                'start_time' => Carbon::now()->addHours(2),
                'end_time' => Carbon::now()->addHours(4),
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
                'room_id' => $roomAudiensi->id,
                'category_id' => $catAudiensi->id,
                'start_time' => Carbon::tomorrow()->setTime(10, 0),
                'end_time' => Carbon::tomorrow()->setTime(12, 0),
                'dress_code' => 'Batik Motif Daerah',
                'participants' => 'Wakajati & Asisten Intelijen',
                'status' => 'scheduled',
                'created_by' => $protokol->id,
            ]
        );
    }
}
