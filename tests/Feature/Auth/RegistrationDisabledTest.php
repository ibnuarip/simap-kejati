<?php

use Laravel\Fortify\Features;

beforeEach(function () {
    if (Features::enabled(Features::registration())) {
        $this->markTestSkipped('Registrasi publik sedang aktif.');
    }
});

test('registration screen redirects to login', function () {
    $response = $this->get('/register');

    $response->assertRedirect(route('login'));
});

test('registration requests are redirected to login without creating users', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertRedirect(route('login'));
    $this->assertGuest();
    $this->assertDatabaseCount('users', 0);
});
