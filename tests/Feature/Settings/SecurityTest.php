<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;
use Laravel\Fortify\TwoFactorAuthenticationProvider;
use PragmaRX\Google2FA\Google2FA;

test('security page is displayed', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);
    Features::passkeys([
        'confirmPassword' => true,
    ]);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('security.edit'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/security')
            ->where('canManagePasskeys', true)
            ->where('passkeys', [])
            ->where('canManageTwoFactor', true)
            ->where('twoFactorEnabled', false),
        );
});

test('security page requires password confirmation when enabled', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    $user = User::factory()->create();

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $response = $this->actingAs($user)
        ->get(route('security.edit'));

    $response->assertRedirect(route('password.confirm'));
});

test('security page renders without two factor when feature is disabled', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    config(['fortify.features' => []]);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('security.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/security')
            ->where('canManagePasskeys', false)
            ->where('passkeys', [])
            ->where('canManageTwoFactor', false)
            ->missing('twoFactorEnabled')
            ->missing('requiresConfirmation'),
        );
});

test('password can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('security.edit'))
        ->put(route('user-password.update'), [
            'current_password' => 'password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('security.edit'));

    expect(Hash::check('new-password', $user->refresh()->password))->toBeTrue();
});

test('correct password must be provided to update password', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('security.edit'))
        ->put(route('user-password.update'), [
            'current_password' => 'wrong-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

    $response
        ->assertSessionHasErrors('current_password')
        ->assertRedirect(route('security.edit'));
});

test('two factor cannot be disabled without a TOTP code', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    $secret = app(TwoFactorAuthenticationProvider::class)->generateSecretKey();

    $user = User::factory()->create([
        'two_factor_secret' => encrypt($secret),
        'two_factor_recovery_codes' => encrypt(json_encode(['recovery-code-1'])),
        'two_factor_confirmed_at' => now(),
    ]);

    $response = $this
        ->actingAs($user)
        ->from(route('security.edit'))
        ->post(route('settings.two-factor.disable'), ['code' => '']);

    $response
        ->assertSessionHasErrors('code')
        ->assertRedirect(route('security.edit'));

    expect($user->refresh()->two_factor_secret)->not->toBeNull();
});

test('two factor can be disabled after verifying a valid TOTP code', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    $secret = app(TwoFactorAuthenticationProvider::class)->generateSecretKey();

    $user = User::factory()->create([
        'two_factor_secret' => encrypt($secret),
        'two_factor_recovery_codes' => encrypt(json_encode(['recovery-code-1'])),
        'two_factor_confirmed_at' => now(),
    ]);

    $code = app(Google2FA::class)->getCurrentOtp($secret);

    $response = $this
        ->actingAs($user)
        ->from(route('security.edit'))
        ->post(route('settings.two-factor.disable'), ['code' => $code]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('security.edit'));

    $user->refresh();

    expect($user->two_factor_secret)->toBeNull()
        ->and($user->two_factor_recovery_codes)->toBeNull();
});

test('two factor cannot be disabled with a wrong TOTP code', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    $secret = app(TwoFactorAuthenticationProvider::class)->generateSecretKey();

    $user = User::factory()->create([
        'two_factor_secret' => encrypt($secret),
        'two_factor_recovery_codes' => encrypt(json_encode(['recovery-code-1'])),
        'two_factor_confirmed_at' => now(),
    ]);

    $wrongCode = app(Google2FA::class)->getCurrentOtp(app(TwoFactorAuthenticationProvider::class)->generateSecretKey());

    $response = $this
        ->actingAs($user)
        ->from(route('security.edit'))
        ->post(route('settings.two-factor.disable'), ['code' => $wrongCode]);

    $response
        ->assertSessionHasErrors('code')
        ->assertRedirect(route('security.edit'));

    expect($user->refresh()->two_factor_secret)->not->toBeNull();
});

test('two factor cannot be disabled when not enabled', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('settings.two-factor.disable'), ['code' => '000000'])
        ->assertNotFound();
});

test('user can delete their own passkey', function () {
    $this->skipUnlessFortifyHas(Features::passkeys());

    $user = User::factory()->create();

    $passkey = $user->passkeys()->create([
        'name' => 'Chrome on Windows',
        'credential_id' => 'cred-own-123',
        'credential' => json_encode(['id' => 'cred-own-123']),
    ]);

    $response = $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->from(route('security.edit'))
        ->delete(route('passkey.destroy', $passkey));

    $response->assertRedirect(route('security.edit'));

    $this->assertDatabaseMissing('passkeys', [
        'id' => $passkey->id,
    ]);
});

test('user cannot delete another users passkey', function () {
    $this->skipUnlessFortifyHas(Features::passkeys());

    $owner = User::factory()->create();
    $otherUser = User::factory()->create();

    $passkey = $owner->passkeys()->create([
        'name' => 'Owner Passkey',
        'credential_id' => 'cred-owner-123',
        'credential' => json_encode(['id' => 'cred-owner-123']),
    ]);

    $response = $this->actingAs($otherUser)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->from(route('security.edit'))
        ->delete(route('passkey.destroy', $passkey));

    $response->assertForbidden();

    $this->assertDatabaseHas('passkeys', [
        'id' => $passkey->id,
    ]);
});

test('password update returns localized 429 json payload when rate limited via inertia', function () {
    $user = User::factory()->create();

    for ($i = 0; $i < 6; $i++) {
        $this->actingAs($user)
            ->from(route('security.edit'))
            ->put(route('user-password.update'), [
                'current_password' => 'wrong-password',
                'password' => 'new-password',
                'password_confirmation' => 'new-password',
            ]);
    }

    $response = $this->actingAs($user)
        ->withHeaders(['X-Inertia' => 'true'])
        ->put(route('user-password.update'), [
            'current_password' => 'wrong-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

    $response->assertTooManyRequests()
        ->assertJsonStructure(['message', 'retry_after'])
        ->assertHeader('Retry-After');

    expect($response->json('message'))->toContain('Terlalu banyak permintaan');
    expect($response->json('retry_after'))->toBeGreaterThan(0);
});
