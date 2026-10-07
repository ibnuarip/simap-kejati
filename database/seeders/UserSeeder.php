<?php

namespace Database\Seeders;

use App\Models\Leader;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * 4 akun peran (idempotent by email). Dijalankan setelah
     * LeaderSeeder karena akun pimpinan ditautkan ke datanya dan
     * akun protokol diberi akses ke seluruh pimpinan.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'daskrimti.kejatijabar@gmail.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'role' => 'superadmin',
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
                'name' => 'Dr. RD Mohammad Teguh Darmawan, S.H., M.H',
                'password' => Hash::make('password'),
                'role' => 'pimpinan',
                'email_verified_at' => now(),
                'reminder_hours' => ['24'],
            ]
        );

        $wakajati = User::updateOrCreate(
            ['email' => 'wakajati@kejati.go.id'],
            [
                'name' => 'Dr. Desy Meutia Firdaus, S.H., M.Hum',
                'password' => Hash::make('password'),
                'role' => 'pimpinan',
                'email_verified_at' => now(),
                'reminder_hours' => ['24'],
            ]
        );

        $kajati->forceFill([
            'leader_id' => Leader::where('position', 'Kepala Kejaksaan Tinggi')->value('id'),
        ])->save();

        $wakajati->forceFill([
            'leader_id' => Leader::where('position', 'Wakil Kepala Kejaksaan Tinggi')->value('id'),
        ])->save();

        $protokol->leaders()->sync(Leader::query()->pluck('id')->all());
    }
}
