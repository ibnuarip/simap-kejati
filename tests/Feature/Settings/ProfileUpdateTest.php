<?php

use App\Mail\Auth\AccountDeletedMail;
use App\Mail\Auth\EmailChangedMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('profile.edit'));

    $response->assertOk();
});

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->name)->toBe('Test User');
    expect($user->email)->toBe('test@example.com');
    expect($user->email_verified_at)->toBeNull();
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => $user->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('changing the profile email queues a notification email to the new address', function () {
    Mail::fake();

    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => 'email-baru@kejati.go.id',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'))
        ->assertSessionHas('inertia.flash_data', fn (array $flash): bool => ($flash['toast']['message'] ?? null) === 'Email berhasil diperbarui.');

    Mail::assertQueued(EmailChangedMail::class, fn (EmailChangedMail $mail): bool => $mail->hasTo('email-baru@kejati.go.id'));
});

test('updating the profile without changing the email does not queue a notification email', function () {
    Mail::fake();

    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => $user->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'))
        ->assertSessionHas('inertia.flash_data', fn (array $flash): bool => ($flash['toast']['message'] ?? null) === 'Profil berhasil diperbarui.');

    Mail::assertNotQueued(EmailChangedMail::class);
});

test('profile email cannot be changed to one already used by another account', function () {
    $user = User::factory()->create();
    User::factory()->create(['email' => 'terpakai@kejati.go.id']);

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => 'terpakai@kejati.go.id',
        ]);

    $response->assertSessionHasErrors([
        'email' => 'Email sudah digunakan oleh akun lain.',
    ]);

    expect($user->refresh()->email)->not->toBe('terpakai@kejati.go.id');
});

test('user can delete their account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->delete(route('profile.destroy'), [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    $this->assertGuest();
    expect($user->fresh())->toBeNull();
});

test('self-deleting a protokol account queues a confirmation email to that account', function () {
    Mail::fake();

    $user = User::factory()->protokol()->create();

    $this->actingAs($user)
        ->delete(route('profile.destroy'), ['password' => 'password'])
        ->assertRedirect(route('home'));

    $this->assertGuest();

    Mail::assertQueued(AccountDeletedMail::class, fn (AccountDeletedMail $mail): bool => $mail->hasTo($user->email));
});

test('self-deleting a pimpinan account queues a confirmation email to that account', function () {
    Mail::fake();

    $user = User::factory()->pimpinan()->create();

    $this->actingAs($user)
        ->delete(route('profile.destroy'), ['password' => 'password'])
        ->assertRedirect(route('home'));

    $this->assertGuest();

    Mail::assertQueued(AccountDeletedMail::class, fn (AccountDeletedMail $mail): bool => $mail->hasTo($user->email));
});

test('self-deleting a superadmin account does not queue a confirmation email', function () {
    Mail::fake();

    $user = User::factory()->superadmin()->create();

    $this->actingAs($user)
        ->delete(route('profile.destroy'), ['password' => 'password'])
        ->assertRedirect(route('home'));

    $this->assertGuest();

    Mail::assertNotQueued(AccountDeletedMail::class);
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->delete(route('profile.destroy'), [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect(route('profile.edit'));

    expect($user->fresh())->not->toBeNull();
});
