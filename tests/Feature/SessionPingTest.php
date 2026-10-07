<?php

use App\Models\User;

test('guests cannot ping the session', function () {
    $this->get(route('session.ping'))->assertRedirect(route('login'));
});

test('authenticated users can ping the session', function () {
    $user = User::factory()->superadmin()->create();
    $this->actingAs($user);

    $this->getJson(route('session.ping'))
        ->assertOk()
        ->assertJson(['ok' => true]);
});
