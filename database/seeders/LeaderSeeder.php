<?php

namespace Database\Seeders;

use App\Models\Leader;
use Illuminate\Database\Seeder;

class LeaderSeeder extends Seeder
{
    /**
     * 12 jabatan struktural (idempotent by position).
     */
    public function run(): void
    {
        Leader::firstOrCreate(
            ['position' => 'Kepala Kejaksaan Tinggi'],
            [
                'name' => 'Dr. RD Mohammad Teguh Darmawan, S.H., M.H',
                'nip' => '197001011995031001',
                'email' => 'kajati@kejati.go.id',
                'phone' => '081234567890',
                'is_active' => true,
            ]
        );

        Leader::firstOrCreate(
            ['position' => 'Wakil Kepala Kejaksaan Tinggi'],
            [
                'name' => 'Dr. Desy Meutia Firdaus, S.H., M.Hum',
                'nip' => '197205121997031002',
                'email' => 'wakajati@kejati.go.id',
                'phone' => '081234567891',
                'is_active' => true,
            ]
        );

        $extraPositions = [
            'Asisten Bidang Pembinaan',
            'Asisten Bidang Intelijen',
            'Asisten Bidang Tindak Pidana Umum',
            'Asisten Bidang Tindak Pidana Khusus',
            'Asisten Bidang Perdata dan Tata Usaha Negara',
            'Asisten Bidang Pidana Militer',
            'Asisten Bidang Pemulihan Aset',
            'Asisten Bidang Pengawasan',
            'Bagian Tata Usaha',
            'Koordinator',
        ];

        foreach ($extraPositions as $position) {
            Leader::firstOrCreate(
                ['position' => $position],
                [
                    'name' => fake()->name(),
                    'nip' => fake()->numerify('##################'),
                    'email' => fake()->unique()->safeEmail(),
                    'phone' => '08'.fake()->numerify('##########'),
                    'is_active' => true,
                ]
            );
        }
    }
}
