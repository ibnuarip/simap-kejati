<?php

use App\Models\User;

test('kajati can access the leadership dashboard', function () {
    $user = User::factory()->kajati()->create();
    $this->actingAs($user);

    $this->get(route('leadership.dashboard'))->assertOk();
});

test('wakajati can access the leadership dashboard', function () {
    $user = User::factory()->wakajati()->create();
    $this->actingAs($user);

    $this->get(route('leadership.dashboard'))->assertOk();
});

test('leadership can access calendar and notification pages', function () {
    $user = User::factory()->kajati()->create();
    $this->actingAs($user);

    foreach (['leadership.calendar.index', 'leadership.notifications.index'] as $route) {
        $this->get(route($route))->assertOk();
    }
});

test('non leadership roles are forbidden from leadership routes', function (string $role) {
    $user = User::factory()->create(['role' => $role]);
    $this->actingAs($user);

    $this->get(route('leadership.dashboard'))->assertForbidden();
})->with(['operator', 'protokol']);

test('leadership is redirected to their dashboard after login', function (string $role) {
    $user = User::factory()->create(['role' => $role]);

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect('/leadership');
})->with(['kajati', 'wakajati']);
