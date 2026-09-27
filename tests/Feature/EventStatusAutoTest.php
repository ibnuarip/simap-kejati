<?php

use App\Models\Event;
use App\Models\User;

test('scheduled events are reported as scheduled before they start', function () {
    $event = Event::factory()->create([
        'start_time' => now()->addDay()->setTime(9, 0),
        'end_time' => now()->addDay()->setTime(11, 0),
        'status' => 'scheduled',
    ]);

    expect($event->currentStatus())->toBe('scheduled');
});

test('events are reported as ongoing while in progress', function () {
    $event = Event::factory()->create([
        'start_time' => now()->subMinutes(30),
        'end_time' => now()->addMinutes(30),
        'status' => 'scheduled',
    ]);

    expect($event->currentStatus())->toBe('ongoing');
});

test('events are reported as completed after they end', function () {
    $event = Event::factory()->create([
        'start_time' => now()->subHours(2),
        'end_time' => now()->subHour(),
        'status' => 'scheduled',
    ]);

    expect($event->currentStatus())->toBe('completed');
});

test('cancelled events keep their cancelled status regardless of time', function () {
    $event = Event::factory()->create([
        'start_time' => now()->subHours(2),
        'end_time' => now()->subHour(),
        'status' => 'cancelled',
    ]);

    expect($event->currentStatus())->toBe('cancelled');
});

test('operator can cancel an event and it is stored as cancelled', function () {
    $operator = User::factory()->operator()->create();
    $event = Event::factory()->create();

    $this->actingAs($operator)
        ->post(route('events.cancel', $event))
        ->assertRedirect();

    $this->assertDatabaseHas('events', [
        'id' => $event->id,
        'status' => 'cancelled',
    ]);
});

test('protokol can cancel an event and it is stored as cancelled', function () {
    $protokol = User::factory()->protokol()->create();
    $event = Event::factory()->create();

    $this->actingAs($protokol)
        ->post(route('protokol.events.cancel', $event))
        ->assertRedirect();

    $this->assertDatabaseHas('events', [
        'id' => $event->id,
        'status' => 'cancelled',
    ]);
});

test('operator cannot cancel an event that has already started', function () {
    $operator = User::factory()->operator()->create();
    $event = Event::factory()->create([
        'start_time' => now()->subMinutes(30),
        'end_time' => now()->addMinutes(30),
    ]);

    $this->actingAs($operator)
        ->post(route('events.cancel', $event))
        ->assertSessionHasErrors('event');

    $this->assertDatabaseHas('events', [
        'id' => $event->id,
        'status' => 'scheduled',
    ]);
});

test('operator cannot cancel an event that has already finished', function () {
    $operator = User::factory()->operator()->create();
    $event = Event::factory()->create([
        'start_time' => now()->subHours(2),
        'end_time' => now()->subHour(),
    ]);

    $this->actingAs($operator)
        ->post(route('events.cancel', $event))
        ->assertSessionHasErrors('event');

    $this->assertDatabaseHas('events', [
        'id' => $event->id,
        'status' => 'scheduled',
    ]);
});

test('protokol cannot cancel an event that has already finished', function () {
    $protokol = User::factory()->protokol()->create();
    $event = Event::factory()->create([
        'start_time' => now()->subHours(2),
        'end_time' => now()->subHour(),
    ]);

    $this->actingAs($protokol)
        ->post(route('protokol.events.cancel', $event))
        ->assertSessionHasErrors('event');

    $this->assertDatabaseHas('events', [
        'id' => $event->id,
        'status' => 'scheduled',
    ]);
});
