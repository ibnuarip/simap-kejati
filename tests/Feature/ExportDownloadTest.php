<?php

use App\Models\Event;
use App\Models\User;

test('protokol can download an xlsx file for a daily report', function () {
    $protokol = User::factory()->protokol()->create();
    Event::factory()->create();

    $this->actingAs($protokol)
        ->get(route('protokol.exports.download', [
            'type' => 'daily',
            'date' => now()->format('Y-m-d'),
            'format' => 'xlsx',
        ]))
        ->assertOk()
        ->assertDownload('agenda-harian-'.now()->format('Y-m-d').'.xlsx');
});

test('protokol can download a csv file for a daily report', function () {
    $protokol = User::factory()->protokol()->create();
    Event::factory()->create();

    $this->actingAs($protokol)
        ->get(route('protokol.exports.download', [
            'type' => 'daily',
            'date' => now()->format('Y-m-d'),
            'format' => 'csv',
        ]))
        ->assertOk()
        ->assertDownload('agenda-harian-'.now()->format('Y-m-d').'.csv');
});

test('protokol can download a monthly report as xlsx', function () {
    $protokol = User::factory()->protokol()->create();
    Event::factory()->create();

    $this->actingAs($protokol)
        ->get(route('protokol.exports.download', [
            'type' => 'monthly',
            'month' => now()->format('Y-m'),
            'format' => 'xlsx',
        ]))
        ->assertOk()
        ->assertDownload('rekap-bulanan-'.now()->format('Y-m').'.xlsx');
});

test('protokol can download weekly, yearly, and custom reports as xlsx', function () {
    $protokol = User::factory()->protokol()->create();
    Event::factory()->create();

    $week = now()->format('o-\WW');

    $this->actingAs($protokol)
        ->get(route('protokol.exports.download', [
            'type' => 'weekly',
            'week' => $week,
            'format' => 'xlsx',
        ]))
        ->assertOk()
        ->assertDownload("rekap-mingguan-{$week}.xlsx");

    $this->actingAs($protokol)
        ->get(route('protokol.exports.download', [
            'type' => 'yearly',
            'year' => now()->format('Y'),
            'format' => 'xlsx',
        ]))
        ->assertOk()
        ->assertDownload('rekap-tahunan-'.now()->format('Y').'.xlsx');

    $today = now()->format('Y-m-d');

    $this->actingAs($protokol)
        ->get(route('protokol.exports.download', [
            'type' => 'custom',
            'start' => $today,
            'end' => $today,
            'format' => 'csv',
        ]))
        ->assertOk()
        ->assertDownload("rekap-kustom-{$today}_sd_{$today}.csv");
});

test('custom report rejects an end date before the start date in indonesian', function () {
    $protokol = User::factory()->protokol()->create();

    $this->actingAs($protokol)
        ->get(route('protokol.exports.download', [
            'type' => 'custom',
            'start' => now()->format('Y-m-d'),
            'end' => now()->subDay()->format('Y-m-d'),
            'format' => 'xlsx',
        ]))
        ->assertStatus(302)
        ->assertSessionHasErrors(['end' => 'Tanggal selesai tidak boleh sebelum tanggal mulai.']);
});

test('download rejects an unknown period type in indonesian', function () {
    $protokol = User::factory()->protokol()->create();

    $this->actingAs($protokol)
        ->get(route('protokol.exports.download', [
            'type' => 'semestran',
            'format' => 'xlsx',
        ]))
        ->assertStatus(302)
        ->assertSessionHasErrors(['type' => 'Jenis periode tidak valid.']);
});

test('download rejects an unsupported export format', function () {
    $protokol = User::factory()->protokol()->create();

    $this->actingAs($protokol)
        ->get(route('protokol.exports.download', [
            'type' => 'daily',
            'date' => now()->format('Y-m-d'),
            'format' => 'pdf',
        ]))
        ->assertStatus(422);
});

test('non protokol roles cannot download exports', function () {
    $operator = User::factory()->operator()->create();

    $this->actingAs($operator)
        ->get(route('protokol.exports.download', [
            'type' => 'daily',
            'date' => now()->format('Y-m-d'),
            'format' => 'xlsx',
        ]))
        ->assertForbidden();
});
