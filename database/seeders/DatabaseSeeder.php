<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Orkestrasi seeding awal. Pada environment production, hanya akun
     * Superadmin yang dibuat agar database bersih dari data contoh/dummy.
     * Pada environment non-production, seluruh master dan akun peran dibuat.
     */
    public function run(): void
    {
        if (app()->isProduction()) {
            $this->call([
                UserSeeder::class,
            ]);

            return;
        }

        $this->call([
            LeaderSeeder::class,
            UserSeeder::class,
            RoomSeeder::class,
            CategorySeeder::class,
        ]);

        // Data dummy agenda (100 baris, awalan judul "[DUMMY]").
        // Khusus local agar environment testing/staging tetap bersih.
        if (app()->isLocal()) {
            $this->call(AgendaDummySeeder::class);
        }
    }
}
