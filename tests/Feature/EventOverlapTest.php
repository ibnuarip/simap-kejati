<?php

use App\Models\Category;
use App\Models\Event;
use App\Models\Leader;
use App\Models\User;

function createOverlapScenario(): array
{
    $leader = Leader::factory()->create(['position' => 'Kepala Kejaksaan Tinggi']);
    $category = Category::factory()->create();
    $day = now(config('app.timezone'))->addDay()->format('Y-m-d');

    $existing = Event::factory()->create([
        'leader_id' => $leader->id,
        'category_id' => $category->id,
        'status' => 'scheduled',
        'start_time' => "{$day} 10:00:00",
        'end_time' => "{$day} 12:00:00",
    ]);

    return [$leader, $category, $day, $existing];
}

function overlapPayload(Leader $leader, Category $category, string $day, string $start, string $end, array $extra = []): array
{
    return array_merge([
        'title' => 'Agenda Bentrok',
        'leader_id' => $leader->id,
        'category_id' => $category->id,
        'start_time' => "{$day} {$start}",
        'end_time' => "{$day} {$end}",
    ], $extra);
}

test('storing an overlapping agenda is rejected in indonesian', function () {
    $protokol = User::factory()->protokol()->create();
    [$leader, $category, $day] = createOverlapScenario();
    $protokol->leaders()->attach($leader->id);

    $response = $this->actingAs($protokol)->post(
        route('protokol.events.store'),
        overlapPayload($leader, $category, $day, '11:00:00', '13:00:00')
    );

    $response->assertSessionHasErrors('start_time');
    expect(session('errors')->get('start_time')[0])->toContain('bentrok');
    expect(Event::where('title', 'Agenda Bentrok')->exists())->toBeFalse();
});

test('storing an overlapping agenda is allowed with force save', function () {
    $protokol = User::factory()->protokol()->create();
    [$leader, $category, $day] = createOverlapScenario();
    $protokol->leaders()->attach($leader->id);

    $this->actingAs($protokol)->post(
        route('protokol.events.store'),
        overlapPayload($leader, $category, $day, '11:00:00', '13:00:00', ['force_save' => '1'])
    )->assertSessionHasNoErrors();

    expect(Event::where('title', 'Agenda Bentrok')->exists())->toBeTrue();
});

test('adjacent agendas do not count as overlapping', function () {
    $protokol = User::factory()->protokol()->create();
    [$leader, $category, $day] = createOverlapScenario();
    $protokol->leaders()->attach($leader->id);

    $this->actingAs($protokol)->post(
        route('protokol.events.store'),
        overlapPayload($leader, $category, $day, '12:00:00', '13:00:00', ['title' => 'Agenda Mepet'])
    )->assertSessionHasNoErrors();

    expect(Event::where('title', 'Agenda Mepet')->exists())->toBeTrue();
});

test('cancelled agendas do not block a new schedule', function () {
    $protokol = User::factory()->protokol()->create();
    [$leader, $category, $day, $existing] = createOverlapScenario();
    $protokol->leaders()->attach($leader->id);
    $existing->update(['status' => 'cancelled']);

    $this->actingAs($protokol)->post(
        route('protokol.events.store'),
        overlapPayload($leader, $category, $day, '11:00:00', '13:00:00', ['title' => 'Agenda Pengganti'])
    )->assertSessionHasNoErrors();

    expect(Event::where('title', 'Agenda Pengganti')->exists())->toBeTrue();
});

test('updating an agenda ignores itself when checking overlaps', function () {
    $protokol = User::factory()->protokol()->create();
    [$leader, $category, $day, $existing] = createOverlapScenario();
    $protokol->leaders()->attach($leader->id);

    $this->actingAs($protokol)->put(
        route('protokol.events.update', $existing),
        overlapPayload($leader, $category, $day, '10:00:00', '12:00:00', ['title' => 'Agenda Diubah'])
    )->assertSessionHasNoErrors();

    expect($existing->fresh()->title)->toBe('Agenda Diubah');
});

test('conflicts endpoint lists overlapping agendas as json', function () {
    $protokol = User::factory()->protokol()->create();
    [$leader, $category, $day, $existing] = createOverlapScenario();
    $protokol->leaders()->attach($leader->id);

    $response = $this->actingAs($protokol)->getJson(
        route('protokol.events.conflicts', ['start' => "{$day} 11:00:00", 'end' => "{$day} 13:00:00"])
    );

    $response->assertOk()->assertJsonCount(1, 'events');
    expect($response->json('count'))->toBe(1);
    expect($response->json('events.0.title'))->toBe($existing->title);

    // Agenda itu sendiri dikecualikan saat mode edit.
    $response = $this->actingAs($protokol)->getJson(
        route('protokol.events.conflicts', [
            'start' => "{$day} 11:00:00",
            'end' => "{$day} 13:00:00",
            'except_id' => $existing->id,
        ])
    );

    $response->assertOk();
    expect($response->json('count'))->toBe(0);
});
