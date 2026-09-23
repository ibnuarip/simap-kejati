<?php

use App\Models\User;

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
