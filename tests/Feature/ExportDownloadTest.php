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
