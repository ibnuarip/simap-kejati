<?php

use App\Models\Leader;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('redirects an authenticated superadmin to the superadmin dashboard', function () {
    $this->actingAs(User::factory()->create(['role' => 'superadmin']))
        ->get(route('home'))
        ->assertRedirect('/dashboard');
});

it('redirects an authenticated protokol member to the protokol dashboard', function () {
    $this->actingAs(User::factory()->create(['role' => 'protokol']))
        ->get(route('home'))
        ->assertRedirect('/protokol');
});

it('redirects an authenticated leader to the leadership dashboard', function (string $role) {
    $user = User::factory()->create(['role' => $role]);

    if ($role === 'pimpinan') {
        $user->forceFill(['leader_id' => Leader::factory()->create()->id])->save();
    }

    $this->actingAs($user)
        ->get(route('home'))
        ->assertRedirect('/leadership');
})->with(['pimpinan']);

it('shows the login homepage to guests', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('home')
            ->has('canResetPassword')
            ->has('canUsePasskey')
        );
});
