<?php

use App\Mail\Auth\AccountCredentialsMail;
use App\Mail\Auth\AccountDeletedMail;
use App\Mail\Auth\EmailChangedMail;
use App\Mail\Auth\PasskeyAddedMail;
use App\Mail\Auth\PasskeyRemovedMail;
use App\Mail\Auth\PasswordChangedMail;
use App\Mail\Auth\ResetPasswordMail;
use App\Mail\Auth\TwoFactorDisabledMail;
use App\Mail\Auth\TwoFactorEnabledMail;
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

test('passkey added email greets the user and shows the passkey name', function () {
    $user = User::factory()->create(['name' => 'Budi Santoso']);

    $mail = new PasskeyAddedMail($user, 'Chrome on Windows', '01/11/2026 10:00');

    $mail->assertSeeInHtml('Passkey Baru Ditambahkan');
    $mail->assertSeeInHtml('Budi Santoso');
    $mail->assertSeeInHtml('Chrome on Windows');
    $mail->assertSeeInHtml('01/11/2026 10:00');
    $mail->assertSeeInText('Yth. Budi Santoso');
    $mail->assertSeeInText('Chrome on Windows');
});

test('passkey removed email shows the passkey name and warning', function () {
    $user = User::factory()->create(['name' => 'Budi Santoso']);

    $mail = new PasskeyRemovedMail($user, 'iPhone Safari', '01/11/2026 10:00');

    $mail->assertSeeInHtml('Passkey Dihapus');
    $mail->assertSeeInHtml('iPhone Safari');
    $mail->assertSeeInText('segera periksa daftar passkey');
});

test('password changed email confirms the change without revealing the password', function () {
    $user = User::factory()->create(['name' => 'Budi Santoso']);

    $mail = new PasswordChangedMail($user, '01/11/2026 10:00');

    $mail->assertSeeInHtml('Kata Sandi Berhasil Diubah');
    $mail->assertSeeInHtml('Budi Santoso');
    $mail->assertSeeInHtml('01/11/2026 10:00');
    $mail->assertSeeInText('Jika bukan, segera atur ulang kata sandi');
});

test('two factor enabled email explains the new login step', function () {
    $user = User::factory()->create(['name' => 'Budi Santoso']);

    $mail = new TwoFactorEnabledMail($user, '01/11/2026 10:00');

    $mail->assertSeeInHtml('Autentikasi Dua Faktor Diaktifkan');
    $mail->assertSeeInHtml('aplikasi autentikator');
    $mail->assertSeeInText('recovery codes');
});

test('two factor disabled email warns that the account is password only again', function () {
    $user = User::factory()->create(['name' => 'Budi Santoso']);

    $mail = new TwoFactorDisabledMail($user, '01/11/2026 10:00');

    $mail->assertSeeInHtml('Autentikasi Dua Faktor Dinonaktifkan');
    $mail->assertSeeInText('hanya dilindungi oleh kata sandi');
});

test('email changed email shows the old and new addresses with a verification note', function () {
    $user = User::factory()->create(['name' => 'Budi Santoso']);

    $mail = new EmailChangedMail($user, 'lama@kejati.go.id', 'baru@kejati.go.id', '01/11/2026 10:00');

    $mail->assertSeeInHtml('Alamat Email Berhasil Diubah');
    $mail->assertSeeInHtml('Budi Santoso');
    $mail->assertSeeInHtml('lama@kejati.go.id');
    $mail->assertSeeInHtml('baru@kejati.go.id');
    $mail->assertSeeInHtml('01/11/2026 10:00');
    $mail->assertSeeInText('verifikasi ulang');
    $mail->assertSeeInText('Yth. Budi Santoso');
});

test('account deleted email confirms the deletion', function () {
    $mail = new AccountDeletedMail('Budi Santoso', 'budi@kejati.go.id', 'Protokol', '01/11/2026 10:00', 'self');

    $mail->assertSeeInHtml('Konfirmasi Penghapusan Akun');
    $mail->assertSeeInHtml('Budi Santoso');
    $mail->assertSeeInHtml('budi@kejati.go.id');
    $mail->assertSeeInHtml('Anda sendiri');
    $mail->assertSeeInText('Terima kasih telah menggunakan');
});

test('account deleted email marks administrator initiated deletions', function () {
    $mail = new AccountDeletedMail('Budi Santoso', 'budi@kejati.go.id', 'Pimpinan', '01/11/2026 10:00', 'admin');

    $mail->assertSeeInHtml('Superadmin');
    $mail->assertSeeInHtml('budi@kejati.go.id');
});
