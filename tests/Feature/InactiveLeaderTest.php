<?php

use App\Models\Event;
use App\Models\Leader;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('leadership accounts are blocked from logging in when their leader is deactivated', function () {
    $leader = Leader::factory()->create(['is_active' => false]);
    $user = User::factory()->pimpinan()->create(['leader_id' => $leader->id]);

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ])
        ->assertSessionHasErrors(['email' => Leader::DEACTIVATED_MESSAGE]);

    $this->assertGuest();
});

test('leadership accounts can still log in while their leader is active', function () {
    $user = User::factory()->pimpinan()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect(route('leadership.dashboard', absolute: false));

    $this->assertAuthenticatedAs($user);
});

test('an active leadership session is revoked once the leader is deactivated', function () {
    $user = User::factory()->pimpinan()->create();
    $leader = $user->leader;

    $this->actingAs($user);

    $this->get(route('leadership.dashboard'))->assertOk();

    $leader->update(['is_active' => false]);

    $this->get(route('leadership.dashboard'))
        ->assertRedirect(route('login'))
        ->assertSessionHasErrors(['email' => Leader::DEACTIVATED_MESSAGE]);

    $this->assertGuest();
});

test('a leader that still has agenda history cannot be deleted', function () {
    $superadmin = User::factory()->superadmin()->create();
    $leader = Leader::factory()->create();
    Event::factory()->create(['leader_id' => $leader->id]);

    $this->actingAs($superadmin);

    $this->delete(route('master.leaders.destroy', $leader))
        ->assertRedirect()
        ->assertSessionHasErrors('leader');

    $this->assertModelExists($leader);
});

test('a leader without agenda history can still be deleted', function () {
    $superadmin = User::factory()->superadmin()->create();
    $leader = Leader::factory()->create();

    $this->actingAs($superadmin);

    $this->delete(route('master.leaders.destroy', $leader))->assertRedirect();

    $this->assertDatabaseMissing('leaders', ['id' => $leader->id]);
});

test('the agenda form only offers active leaders', function () {
    $superadmin = User::factory()->superadmin()->create();
    $active = Leader::factory()->create(['is_active' => true]);
    Leader::factory()->create(['is_active' => false]);

    $this->actingAs($superadmin);

    $this->get(route('events.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('superadmin/events')
            ->has('leaders', 1)
            ->where('leaders.0.id', $active->id));
});

test('agenda history keeps showing the name of a deactivated leader', function () {
    $superadmin = User::factory()->superadmin()->create();
    $leader = Leader::factory()->create(['is_active' => false]);
    $event = Event::factory()->create(['leader_id' => $leader->id]);

    $this->actingAs($superadmin);

    $this->get(route('events.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('superadmin/events')
            ->where('events.0.id', $event->id)
            ->where('events.0.leader.id', $leader->id)
            ->where('events.0.leader.name', $leader->name));
});
