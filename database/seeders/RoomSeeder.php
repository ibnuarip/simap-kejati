<?php

namespace Database\Seeders;

use App\Models\Room;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    /**
     * Ruangan mencakup lantai 1-8 (idempotent by name).
     */
    public function run(): void
    {
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
    }
}
