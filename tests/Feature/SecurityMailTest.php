<?php

use App\Events\PasswordChanged;
use App\Mail\Auth\PasskeyAddedMail;
use App\Mail\Auth\PasskeyRemovedMail;
use App\Mail\Auth\PasswordChangedMail;
use App\Mail\Auth\TwoFactorDisabledMail;
use App\Mail\Auth\TwoFactorEnabledMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Laravel\Fortify\Events\TwoFactorAuthenticationConfirmed;
use Laravel\Fortify\Events\TwoFactorAuthenticationDisabled;
use Laravel\Passkeys\Events\PasskeyDeleted;
use Laravel\Passkeys\Events\PasskeyRegistered;

function makePasskeyFor(User $user, string $name = 'Chrome on Windows')
{
    return $user->passkeys()->create([
        'name' => $name,
        'credential_id' => 'cred-'.uniqid(),
        'credential' => json_encode(['id' => 'cred-'.uniqid()]),
    ]);
}

test('registering a passkey queues a notification email', function () {
    Mail::fake();

    $user = User::factory()->create();
    $passkey = makePasskeyFor($user);

    PasskeyRegistered::dispatch($user, $passkey);

    Mail::assertQueued(PasskeyAddedMail::class, function (PasskeyAddedMail $mail) use ($user, $passkey) {
        return $mail->hasTo($user->email)
            && $mail->passkeyName === $passkey->name;
    });
    Mail::assertQueuedCount(1);
});

test('deleting a passkey queues a notification email', function () {
    Mail::fake();

    $user = User::factory()->create();
    $passkey = makePasskeyFor($user, 'iPhone Safari');

    PasskeyDeleted::dispatch($user, $passkey);

    Mail::assertQueued(PasskeyRemovedMail::class, function (PasskeyRemovedMail $mail) use ($user, $passkey) {
        return $mail->hasTo($user->email)
            && $mail->passkeyName === $passkey->name;
    });
    Mail::assertQueuedCount(1);
});

test('changing a password queues a notification email', function () {
    Mail::fake();

    $user = User::factory()->create();

    PasswordChanged::dispatch($user);

    Mail::assertQueued(PasswordChangedMail::class, function (PasswordChangedMail $mail) use ($user) {
        return $mail->hasTo($user->email);
    });
    Mail::assertQueuedCount(1);
});

test('confirming two factor authentication queues a notification email', function () {
    Mail::fake();

    $user = User::factory()->create();

    TwoFactorAuthenticationConfirmed::dispatch($user);

    Mail::assertQueued(TwoFactorEnabledMail::class, function (TwoFactorEnabledMail $mail) use ($user) {
        return $mail->hasTo($user->email);
    });
    Mail::assertQueuedCount(1);
});

test('disabling two factor authentication queues a notification email', function () {
    Mail::fake();

    $user = User::factory()->create();

    TwoFactorAuthenticationDisabled::dispatch($user);

    Mail::assertQueued(TwoFactorDisabledMail::class, function (TwoFactorDisabledMail $mail) use ($user) {
        return $mail->hasTo($user->email);
    });
    Mail::assertQueuedCount(1);
});
