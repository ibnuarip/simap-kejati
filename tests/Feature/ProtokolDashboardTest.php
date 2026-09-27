<?php

use App\Models\Category;
use App\Models\Event;
use App\Models\Leader;
use App\Models\Room;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('protokol can access the protokol dashboard', function () {
    $user = User::factory()->protokol()->create();
    $this->actingAs($user);

    $this->get(route('protokol.dashboard'))->assertOk();
});

test('protokol can access events, calendar, and export pages', function () {
    $user = User::factory()->protokol()->create();
    $this->actingAs($user);

    foreach (['protokol.events.index', 'protokol.calendar.index', 'protokol.exports.index'] as $route) {
        $this->get(route($route))->assertOk();
    }
});

test('protokol exports page exposes date and month filters', function () {
    $user = User::factory()->protokol()->create();
    $this->actingAs($user);

    $this->get(route('protokol.exports.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('protokol/exports')
            ->has('date')
            ->has('month')
            ->has('dateLabel')
            ->has('monthLabel')
            ->has('todayEvents'));
});

test('protokol can open daily and monthly print reports', function () {
    $user = User::factory()->protokol()->create();
    $this->actingAs($user);

    $this->get(route('protokol.exports.print', ['type' => 'daily', 'date' => now()->format('Y-m-d')]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('print/export-report'));

    $this->get(route('protokol.exports.print', ['type' => 'monthly', 'month' => now()->format('Y-m')]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('print/export-report'));
});

test('protokol can create an event linked to master data', function () {
    $protokol = User::factory()->protokol()->create();
    $leader = Leader::factory()->create();
    $room = Room::factory()->create();
    $category = Category::factory()->create();

    $start = now()->addDay()->setTime(9, 0);
    $end = $start->copy()->addHours(2);

    $this->actingAs($protokol);

    $this->post(route('protokol.events.store'), [
        'title' => 'Rapat Koordinasi Pimpinan',
        'description' => 'Membahas agenda bulanan.',
        'leader_id' => $leader->id,
        'room_id' => $room->id,
        'category_id' => $category->id,
        'custom_location' => null,
        'start_time' => $start->toDateTimeString(),
        'end_time' => $end->toDateTimeString(),
        'dress_code' => 'PDH',
        'participants' => 'Para asisten',
        'status' => 'scheduled',
    ])->assertRedirect();

    $this->assertDatabaseHas('events', [
        'title' => 'Rapat Koordinasi Pimpinan',
        'leader_id' => $leader->id,
        'room_id' => $room->id,
        'category_id' => $category->id,
        'status' => 'scheduled',
        'created_by' => $protokol->id,
    ]);
});

test('protokol can update and delete an event', function () {
    $protokol = User::factory()->protokol()->create();
    $event = Event::factory()->create();

    $this->actingAs($protokol);

    $this->patch(route('protokol.events.update', $event), [
        'title' => $event->title,
        'description' => $event->description,
        'leader_id' => $event->leader_id,
        'room_id' => $event->room_id,
        'category_id' => $event->category_id,
        'custom_location' => $event->custom_location,
        'start_time' => $event->start_time->toDateTimeString(),
        'end_time' => $event->end_time->toDateTimeString(),
        'dress_code' => $event->dress_code,
        'participants' => $event->participants,
        'status' => 'completed',
    ])->assertRedirect();

    $this->assertDatabaseHas('events', ['id' => $event->id, 'status' => 'completed']);

    $this->delete(route('protokol.events.destroy', $event))->assertRedirect();

    $this->assertDatabaseMissing('events', ['id' => $event->id]);
});

test('non protokol roles cannot write protokol events', function () {
    $leader = Leader::factory()->create();
    $operator = User::factory()->operator()->create();

    $this->actingAs($operator)
        ->post(route('protokol.events.store'), [
            'title' => 'Dilarang',
            'leader_id' => $leader->id,
        ])->assertForbidden();
});

test('non protokol roles are forbidden from protokol routes', function (string $role) {
    $user = User::factory()->create(['role' => $role]);
    $this->actingAs($user);

    $this->get(route('protokol.dashboard'))->assertForbidden();
})->with(['operator', 'kajati', 'wakajati']);

test('guests are redirected to login before accessing protokol routes', function () {
    $this->get(route('protokol.dashboard'))->assertRedirect(route('login'));
});

test('protokol is redirected to their dashboard after login', function () {
    $user = User::factory()->protokol()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect('/protokol');
});
