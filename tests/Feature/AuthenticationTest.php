<?php

use App\Models\User;

test('users are redirected to their role home after login', function (string $role, string $redirect) {
    $user = User::factory()->create(['role' => $role]);

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect($redirect);

    $this->assertAuthenticatedAs($user);
    $this->get($redirect)->assertOk();
})->with(
    fn (): array => [
        'operator' => ['operator', '/dashboard'],
        'protokol' => ['protokol', '/protokol'],
        'kajati' => ['kajati', '/leadership'],
        'wakajati' => ['wakajati', '/leadership'],
    ],
);

test('one browser session can only hold one authenticated user', function () {
    $operator = User::factory()->operator()->create();
    $protokol = User::factory()->protokol()->create();

    $this->post('/login', [
        'email' => $operator->email,
        'password' => 'password',
    ])->assertRedirect('/dashboard');
    $this->assertAuthenticatedAs($operator);

    $this->post('/login', [
        'email' => $protokol->email,
        'password' => 'password',
    ])->assertRedirect('/dashboard');
    $this->assertAuthenticatedAs($operator);
});

test('authenticated users visiting the login page go to their role home', function (string $role, string $redirect) {
    $user = User::factory()->create(['role' => $role]);
    $this->actingAs($user);

    $this->get(route('login'))->assertRedirect($redirect);
})->with(
    fn (): array => [
        'operator' => ['operator', '/dashboard'],
        'protokol' => ['protokol', '/protokol'],
        'kajati' => ['kajati', '/leadership'],
    ],
);

test('operator routes are forbidden to other roles', function (string $route, string $role) {
    $user = User::factory()->create(['role' => $role]);
    $this->actingAs($user);

    $this->get(route($route))->assertForbidden();
})->with(
    fn (): array => [
        'dashboard - protokol' => ['dashboard', 'protokol'],
        'dashboard - kajati' => ['dashboard', 'kajati'],
        'master.leaders.index - protokol' => ['master.leaders.index', 'protokol'],
        'master.leaders.index - kajati' => ['master.leaders.index', 'kajati'],
        'master.rooms.index - wakajati' => ['master.rooms.index', 'wakajati'],
        'master.categories.index - protokol' => ['master.categories.index', 'protokol'],
        'users.index - kajati' => ['users.index', 'kajati'],
        'events.index - protokol' => ['events.index', 'protokol'],
        'calendar.index - wakajati' => ['calendar.index', 'wakajati'],
        'settings.system - protokol' => ['settings.system', 'protokol'],
    ],
);

test('operator can access operator routes', function (string $route) {
    $user = User::factory()->operator()->create();
    $this->actingAs($user);

    $this->get(route($route))->assertOk();
})->with([
    'dashboard',
    'master.leaders.index',
    'master.rooms.index',
    'master.categories.index',
    'users.index',
    'events.index',
    'calendar.index',
    'settings.system',
]);
