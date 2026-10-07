<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Orkestrasi seeding awal. Urutan penting: pimpinan dulu (ditautkan
     * ke akun), lalu master lain, terakhir agenda contoh. Seed parsial:
     * php artisan db:seed --class=LeaderSeeder
     */
    public function run(): void
    {
        $this->call([
            LeaderSeeder::class,
            UserSeeder::class,
            RoomSeeder::class,
            CategorySeeder::class,
        ]);

        // Data dummy agenda (100 baris, awalan judul "[DUMMY]").
        // Khusus non-production agar seeding production tetap bersih.
        if (app()->isLocal()) {
            $this->call(AgendaDummySeeder::class);
        }
    }
}
