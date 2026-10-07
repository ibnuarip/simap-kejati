<?php

use App\Mail\Auth\AccountCredentialsMail;
use App\Mail\Auth\ResetPasswordMail;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;

test('reset password email links to the password reset page', function () {
    $mail = new ResetPasswordMail('signed-token-123', 'user@kejati.go.id');

    $mail->assertSeeInHtml('Atur Ulang Kata Sandi');
    $mail->assertSeeInHtml(route('password.reset', [
        'token' => 'signed-token-123',
        'email' => 'user@kejati.go.id',
    ]));
    $mail->assertSeeInText(route('password.reset', [
        'token' => 'signed-token-123',
        'email' => 'user@kejati.go.id',
    ]));
});

test('account credentials email greets the new user and contains the email and temporary password', function () {
    $user = User::factory()->create(['name' => 'Budi Santoso', 'email' => 'budi@kejati.go.id']);

    $mail = new AccountCredentialsMail($user, 'sandi-rahasia-123');

    $mail->assertSeeInHtml('Budi Santoso');
    $mail->assertSeeInHtml('Selamat datang');
    $mail->assertSeeInHtml('budi@kejati.go.id');
    $mail->assertSeeInHtml('sandi-rahasia-123');
    $mail->assertSeeInText('Budi Santoso');
    $mail->assertSeeInText('Selamat datang');
    $mail->assertSeeInText('budi@kejati.go.id');
    $mail->assertSeeInText('sandi-rahasia-123');
});

test('forgot password flow builds the branded reset email for the user', function () {
    $user = User::factory()->create();

    $notification = new ResetPassword('signed-token-123');

    $mail = $notification->toMail($user);

    expect($mail)
        ->toBeInstanceOf(ResetPasswordMail::class)
        ->and($mail->hasTo($user->email))->toBeTrue()
        ->and($mail->render())->toContain('Atur Ulang Kata Sandi');
});
