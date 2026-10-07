<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * 7 kategori kegiatan (idempotent by name).
     */
    public function run(): void
    {
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
    }
}
