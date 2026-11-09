<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('superadmins can visit the dashboard', function () {
    $user = User::factory()->superadmin()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('home page includes open graph and twitter card social preview meta tags', function () {
    $response = $this->get(route('home'));

    $response->assertOk()
        ->assertSee('property="og:type" content="website"', false)
        ->assertSee('property="og:site_name" content="SIMAP Kejaksaan Tinggi Jawa Barat"', false)
        ->assertSee('property="og:title" content="Sistem Informasi Manajemen Agenda Pimpinan"', false)
        ->assertSee('/images/og-image.jpg"', false)
        ->assertSee('property="og:image:width" content="1200"', false)
        ->assertSee('property="og:image:height" content="630"', false)
        ->assertSee('name="twitter:card" content="summary_large_image"', false);

    expect(file_exists(public_path('images/og-image.jpg')))->toBeTrue();
});
