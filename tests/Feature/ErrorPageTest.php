<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('non-existent url renders inertia 404 error page', function () {
    $response = $this->get('/halaman-yang-tidak-tersedia-sama-sekali');

    $response->assertNotFound()
        ->assertInertia(fn (Assert $page) => $page
            ->component('error')
            ->where('status', 404),
        );
});

test('forbidden route renders inertia 403 error page', function () {
    $user = User::factory()->protokol()->create();

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertForbidden()
        ->assertInertia(fn (Assert $page) => $page
            ->component('error')
            ->where('status', 403),
        );
});

test('json request to non-existent url still returns standard 404 json', function () {
    $response = $this->getJson('/halaman-yang-tidak-tersedia-sama-sekali');

    $response->assertNotFound()
        ->assertJsonStructure(['message']);
});
