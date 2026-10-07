<?php

use App\Models\Event;
use App\Models\Leader;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('protokol only sees events of assigned leaders in the manage list', function () {
    $protokol = User::factory()->protokol()->create();
    $assigned = Leader::factory()->create();
    $other = Leader::factory()->create();
    $protokol->leaders()->attach($assigned->id);

    $visible = Event::factory()->create(['leader_id' => $assigned->id]);
    Event::factory()->create(['leader_id' => $other->id]);

    $this->actingAs($protokol)
        ->get(route('protokol.events.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('protokol/events')
            ->has('events', 1)
            ->where('events.0.id', $visible->id)
            ->has('leaders', 1)
            ->where('leaders.0.id', $assigned->id));
});

test('protokol without an assignment sees empty pages', function () {
    $protokol = User::factory()->protokol()->create();
    Event::factory()->create();

    $this->actingAs($protokol);

    $this->get(route('protokol.events.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('events', 0));

    $this->get(route('protokol.calendar.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('events', 0));

    $this->get(route('protokol.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('todayEvents', 0)
            ->has('upcomingEvents', 0));
});

test('protokol cannot create an event for an unassigned leader', function () {
    $protokol = User::factory()->protokol()->create();
    $leader = Leader::factory()->create();

    $this->actingAs($protokol)
        ->post(route('protokol.events.store'), [
            'title' => 'Menyusup',
            'leader_id' => $leader->id,
            'start_time' => now()->addDay()->setTime(9, 0)->toDateTimeString(),
            'end_time' => now()->addDay()->setTime(11, 0)->toDateTimeString(),
        ])
        ->assertSessionHasErrors('leader_id');

    $this->assertDatabaseMissing('events', ['title' => 'Menyusup']);
});

test('protokol cannot modify or cancel events of unassigned leaders', function () {
    $protokol = User::factory()->protokol()->create();
    $assigned = Leader::factory()->create();
    $protokol->leaders()->attach($assigned->id);
    $event = Event::factory()->create();

    $this->actingAs($protokol);

    // leader_id milik sendiri lolos validasi sehingga sampai ke lapis otorisasi.
    $payload = [
        'title' => 'Judul Menyusup',
        'leader_id' => $assigned->id,
        'start_time' => $event->start_time->toDateTimeString(),
        'end_time' => $event->end_time->toDateTimeString(),
    ];

    $this->patch(route('protokol.events.update', $event), $payload)->assertForbidden();
    $this->delete(route('protokol.events.destroy', $event))->assertForbidden();
    $this->post(route('protokol.events.cancel', $event))->assertForbidden();

    expect($event->refresh()->title)->not->toBe('Judul Menyusup');
    $this->assertModelExists($event);
});

test('protokol export reports only contain assigned leaders events', function () {
    $protokol = User::factory()->protokol()->create();
    $assigned = Leader::factory()->create();
    $other = Leader::factory()->create();
    $protokol->leaders()->attach($assigned->id);

    $date = now(config('app.timezone'))->addDay();
    Event::factory()->create([
        'leader_id' => $assigned->id,
        'start_time' => $date->copy()->setTime(9, 0),
        'end_time' => $date->copy()->setTime(10, 0),
    ]);
    Event::factory()->create([
        'leader_id' => $other->id,
        'start_time' => $date->copy()->setTime(9, 0),
        'end_time' => $date->copy()->setTime(10, 0),
    ]);

    $this->actingAs($protokol)
        ->get(route('protokol.exports.print', ['type' => 'daily', 'date' => $date->format('Y-m-d')]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('print/export-report')
            ->has('events', 1)
            ->where('events.0.leader.id', $assigned->id));
});

test('superadmin can assign leaders when creating a protokol user', function () {
    $superadmin = User::factory()->superadmin()->create();
    $this->actingAs($superadmin);

    $kajati = Leader::factory()->create(['position' => 'Kepala Kejaksaan Tinggi']);
    $wakajati = Leader::factory()->create(['position' => 'Wakil Kepala Kejaksaan Tinggi']);

    $this->post(route('users.store'), [
        'name' => 'Protokol Kajati',
        'email' => 'protokol.kajati@kejati.go.id',
        'role' => 'protokol',
        'password' => 'rahasia1234',
        'leaders' => [$kajati->id],
    ])->assertRedirect();

    $user = User::where('email', 'protokol.kajati@kejati.go.id')->firstOrFail();

    expect($user->assignedLeaderIds())->toBe([$kajati->id]);

    $response = $this->get(route('users.index'))->assertOk();
    $props = $response->viewData('page')['props'];

    expect($props['leaders'])->toHaveCount(2);

    $row = collect($props['users'])->firstWhere('email', 'protokol.kajati@kejati.go.id');

    expect($row['leader_ids'])->toBe([$kajati->id]);
});

test('changing a protokol user to another role clears the assignment', function () {
    $superadmin = User::factory()->superadmin()->create();
    $protokol = User::factory()->protokol()->create();
    $leader = Leader::factory()->create();
    $protokol->leaders()->attach($leader->id);

    $this->actingAs($superadmin)
        ->put(route('users.update', $protokol), [
            'name' => $protokol->name,
            'email' => $protokol->email,
            'role' => 'pimpinan',
            'leader_id' => $leader->id,
            'leaders' => [$leader->id],
        ])
        ->assertRedirect();

    $protokol->refresh();

    expect($protokol->role)->toBe('pimpinan')
        ->and($protokol->assignedLeaderIds())->toBe([])
        ->and($protokol->leader_id)->toBe($leader->id);
});

test('creating a pimpinan user requires a linked leader', function () {
    $superadmin = User::factory()->superadmin()->create();
    $this->actingAs($superadmin);

    $this->post(route('users.store'), [
        'name' => 'Pimpinan Tanpa Tautan',
        'email' => 'tanpa.tautan@kejati.go.id',
        'role' => 'pimpinan',
        'password' => 'rahasia1234',
    ])->assertSessionHasErrors('leader_id');

    $this->assertDatabaseMissing('users', ['email' => 'tanpa.tautan@kejati.go.id']);
});
