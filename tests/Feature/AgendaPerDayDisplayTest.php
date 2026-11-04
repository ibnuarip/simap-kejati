<?php

use App\Models\Category;
use App\Models\Event;
use App\Models\Leader;
use App\Models\Room;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function makeAgendaOfDay(int $offsetHours): Event
{
    $start = now()->addDays(7)->setTime(8 + $offsetHours, 0);

    return Event::factory()->create([
        'leader_id' => Leader::factory()->create()->getKey(),
        'room_id' => Room::factory()->create()->getKey(),
        'category_id' => Category::factory()->create()->getKey(),
        'start_time' => $start,
        'end_time' => $start->copy()->addHour(),
    ]);
}

test('protokol events page returns every agenda of the same day', function (): void {
    $protokol = User::factory()->protokol()->create();

    $events = collect([0, 1, 2, 3])
        ->map(fn (int $hour): Event => makeAgendaOfDay($hour));

    $protokol->leaders()->sync($events->pluck('leader_id')->all());

    $this->actingAs($protokol)
        ->get(route('protokol.events.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('protokol/events')
            ->has('events', 4));
});

test('superadmin events page returns every agenda of the same day', function (): void {
    $superadmin = User::factory()->superadmin()->create();

    collect([0, 1, 2, 3])->each(fn (int $hour): Event => makeAgendaOfDay($hour));

    $this->actingAs($superadmin)
        ->get(route('events.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('superadmin/events')
            ->has('events', 4));
});

test('protokol calendar page returns every agenda of the same day', function (): void {
    $protokol = User::factory()->protokol()->create();

    $events = collect([0, 1, 2, 3])
        ->map(fn (int $hour): Event => makeAgendaOfDay($hour));

    $protokol->leaders()->sync($events->pluck('leader_id')->all());

    $this->actingAs($protokol)
        ->get(route('protokol.calendar.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('protokol/calendar')
            ->has('events', 4));
});

test('superadmin calendar page returns every agenda of the same day', function (): void {
    $superadmin = User::factory()->superadmin()->create();

    collect([0, 1, 2, 3])->each(fn (int $hour): Event => makeAgendaOfDay($hour));

    $this->actingAs($superadmin)
        ->get(route('calendar.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('superadmin/calendar')
            ->has('events', 4));
});
