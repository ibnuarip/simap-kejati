<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('leadership can save reminder notification timings', function () {
    $user = User::factory()->kajati()->create();

    $this->actingAs($user)
        ->post(route('leadership.notifications.update'), [
            'timings' => ['1', '24'],
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($user->fresh()->reminder_hours)->toBe(['1', '24']);
});

test('notification settings page shows the saved reminder timings', function () {
    $user = User::factory()->wakajati()->create(['reminder_hours' => ['3', '48']]);

    $this->actingAs($user)
        ->get(route('leadership.notifications.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('leadership/notifications')
            ->where('reminderTimings', ['3', '48']));
});

test('notification timings must contain at least one supported value', function () {
    $user = User::factory()->kajati()->create();

    $this->actingAs($user)
        ->post(route('leadership.notifications.update'), [
            'timings' => ['6'],
        ])
        ->assertSessionHasErrors('timings.0');
});

test('non leadership roles are forbidden from notification settings', function () {
    $operator = User::factory()->operator()->create();

    $this->actingAs($operator)
        ->post(route('leadership.notifications.update'), ['timings' => ['24']])
        ->assertForbidden();
});

test('protokol can save reminder notification timings', function () {
    $user = User::factory()->protokol()->create();

    $this->actingAs($user)
        ->post(route('protokol.notifications.update'), [
            'timings' => ['1', '24'],
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($user->fresh()->reminder_hours)->toBe(['1', '24']);
});

test('protokol notification settings page shows the saved reminder timings', function () {
    $user = User::factory()->protokol()->create(['reminder_hours' => ['3', '48']]);

    $this->actingAs($user)
        ->get(route('protokol.notifications.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('protokol/notifications')
            ->where('reminderTimings', ['3', '48']));
});

test('operator is forbidden from protokol notification settings', function () {
    $operator = User::factory()->operator()->create();

    $this->actingAs($operator)
        ->post(route('protokol.notifications.update'), ['timings' => ['24']])
        ->assertForbidden();
});
