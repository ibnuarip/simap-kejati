<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('redirects an authenticated operator to the operator dashboard', function () {
    $this->actingAs(User::factory()->create(['role' => 'operator']))
        ->get(route('home'))
        ->assertRedirect('/dashboard');
});

it('redirects an authenticated protokol member to the protokol dashboard', function () {
    $this->actingAs(User::factory()->create(['role' => 'protokol']))
        ->get(route('home'))
        ->assertRedirect('/protokol');
});

it('redirects an authenticated leader to the leadership dashboard', function (string $role) {
    $this->actingAs(User::factory()->create(['role' => $role]))
        ->get(route('home'))
        ->assertRedirect('/leadership');
})->with(['kajati', 'wakajati']);

it('shows the welcome page to guests', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('welcome'));
});
