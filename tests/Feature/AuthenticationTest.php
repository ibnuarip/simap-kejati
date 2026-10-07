<?php

use App\Models\Leader;
use App\Models\User;

function createRoleUser(string $role): User
{
    $user = User::factory()->create(['role' => $role]);

    if ($role === 'pimpinan') {
        $user->forceFill(['leader_id' => Leader::factory()->create()->id])->save();
    }

    return $user;
}

test('users are redirected to their role home after login', function (string $role, string $redirect) {
    $user = createRoleUser($role);

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect($redirect);

    $this->assertAuthenticatedAs($user);
    $this->get($redirect)->assertOk();
})->with(
    fn (): array => [
        'superadmin' => ['superadmin', '/dashboard'],
        'protokol' => ['protokol', '/protokol'],
        'pimpinan' => ['pimpinan', '/leadership'],
    ],
);

test('one browser session can only hold one authenticated user', function () {
    $superadmin = User::factory()->superadmin()->create();
    $protokol = User::factory()->protokol()->create();

    $this->post('/login', [
        'email' => $superadmin->email,
        'password' => 'password',
    ])->assertRedirect('/dashboard');
    $this->assertAuthenticatedAs($superadmin);

    $this->post('/login', [
        'email' => $protokol->email,
        'password' => 'password',
    ])->assertRedirect('/dashboard');
    $this->assertAuthenticatedAs($superadmin);
});

test('authenticated users visiting the login page go to their role home', function (string $role, string $redirect) {
    $user = createRoleUser($role);
    $this->actingAs($user);

    $this->get(route('login'))->assertRedirect($redirect);
})->with(
    fn (): array => [
        'superadmin' => ['superadmin', '/dashboard'],
        'protokol' => ['protokol', '/protokol'],
        'pimpinan' => ['pimpinan', '/leadership'],
    ],
);

test('superadmin routes are forbidden to other roles', function (string $route, string $role) {
    $user = createRoleUser($role);
    $this->actingAs($user);

    $this->get(route($route))->assertForbidden();
})->with(
    fn (): array => [
        'dashboard - protokol' => ['dashboard', 'protokol'],
        'dashboard - pimpinan' => ['dashboard', 'pimpinan'],
        'master.leaders.index - protokol' => ['master.leaders.index', 'protokol'],
        'master.leaders.index - pimpinan' => ['master.leaders.index', 'pimpinan'],
        'master.rooms.index - pimpinan' => ['master.rooms.index', 'pimpinan'],
        'master.categories.index - protokol' => ['master.categories.index', 'protokol'],
        'users.index - pimpinan' => ['users.index', 'pimpinan'],
        'events.index - protokol' => ['events.index', 'protokol'],
        'calendar.index - pimpinan' => ['calendar.index', 'pimpinan'],
    ],
);

test('superadmin can access superadmin routes', function (string $route) {
    $user = User::factory()->superadmin()->create();
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
]);
