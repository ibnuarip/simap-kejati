<?php

use App\Models\Leader;
use App\Models\User;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Fortify\Features;
use Laravel\Passkeys\Actions\VerifyPasskey;
use Laravel\Passkeys\Passkey;
use Laravel\Passkeys\Support\WebAuthn;
use ParagonIE\ConstantTime\Base64UrlSafe;
use PragmaRX\Google2FA\Google2FA;
use Webauthn\PublicKeyCredentialRequestOptions;

test('login screen can be rendered', function () {
    $response = $this->get(route('login'));

    $response->assertOk();
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('users with two factor enabled are redirected to two factor challenge', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $user = User::factory()->withTwoFactor()->create();

    $response = $this->post(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('two-factor.login'));
    $response->assertSessionHas('login.id', $user->id);
    $this->assertGuest();
});

test('users are redirected to their role dashboard after completing two factor challenge', function (string $role, string $dashboard) {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $user = User::factory()->withTwoFactor()->create(['role' => $role]);

    if ($role === 'pimpinan') {
        $user->forceFill(['leader_id' => Leader::factory()->create()->id])->save();
    }

    $user->forceFill(['two_factor_secret' => encrypt($secret = 'JBSWY3DPEHPK3PXP')])->save();

    $this->post(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect(route('two-factor.login'));

    $code = (new Google2FA)->getCurrentOtp($secret);

    $this->post(route('two-factor.login.store'), ['code' => $code])
        ->assertRedirect($dashboard);

    $this->assertAuthenticatedAs($user);
    $this->get($dashboard)->assertOk();
})->with([
    'superadmin' => ['superadmin', '/dashboard'],
    'protokol' => ['protokol', '/protokol'],
    'pimpinan' => ['pimpinan', '/leadership'],
]);

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('logout'));

    $response->assertRedirect(route('home'));

    $this->assertGuest();
});

test('users are rate limited', function () {
    $user = User::factory()->create();

    RateLimiter::increment(md5('login'.implode('|', [$user->email, '127.0.0.1'])), amount: 5);

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $response->assertTooManyRequests();
});

test('rate limited inertia login returns localized 429 json payload with retry_after', function () {
    $user = User::factory()->create();

    RateLimiter::increment(md5('login'.implode('|', [$user->email, '127.0.0.1'])), amount: 5);

    $response = $this->withHeaders(['X-Inertia' => 'true'])
        ->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

    $response->assertTooManyRequests()
        ->assertJsonStructure(['message', 'retry_after'])
        ->assertHeader('Retry-After');

    expect($response->json('message'))->toContain('Terlalu banyak permintaan');
    expect($response->json('retry_after'))->toBeGreaterThan(0);
});

test('rate limited passkey login returns localized 429 json payload', function () {
    $this->skipUnlessFortifyHas(Features::passkeys());

    RateLimiter::increment(md5('passkeys'.implode('|', ['cred-123', '127.0.0.1'])), amount: 10);

    $response = $this->postJson(route('passkey.login'), [
        'credential' => ['id' => 'cred-123'],
    ]);

    $response->assertTooManyRequests()
        ->assertJsonStructure(['message', 'retry_after'])
        ->assertHeader('Retry-After');

    expect($response->json('message'))->toContain('Terlalu banyak permintaan');
    expect($response->json('retry_after'))->toBeGreaterThan(0);
});

/**
 * @return array{0: array<string, mixed>, 1: string}
 */
function fakePasskeyVerificationPayload(): array
{
    $options = WebAuthn::toJson(
        PublicKeyCredentialRequestOptions::create(random_bytes(32)),
    );

    $clientDataJson = Base64UrlSafe::encodeUnpadded((string) json_encode([
        'type' => 'webauthn.get',
        'challenge' => Base64UrlSafe::encodeUnpadded('test-challenge'),
        'origin' => 'http://localhost',
    ]));

    $credential = [
        'id' => Base64UrlSafe::encodeUnpadded('test-credential-id'),
        'rawId' => Base64UrlSafe::encodeUnpadded('test-credential-id'),
        'type' => 'public-key',
        'response' => [
            'clientDataJSON' => $clientDataJson,
            'authenticatorData' => Base64UrlSafe::encodeUnpadded(str_repeat("\0", 37)),
            'signature' => Base64UrlSafe::encodeUnpadded('test-signature'),
            'userHandle' => Base64UrlSafe::encodeUnpadded('test-user-handle'),
        ],
    ];

    return [$credential, $options];
}

test('users are redirected to their role dashboard after passkey login', function (string $role, string $dashboard) {
    $this->skipUnlessFortifyHas(Features::passkeys());

    $user = User::factory()->create(['role' => $role]);

    if ($role === 'pimpinan') {
        $user->forceFill(['leader_id' => Leader::factory()->create()->id])->save();
    }

    $passkey = new Passkey;
    $passkey->setRelation('user', $user);

    $this->mock(VerifyPasskey::class)
        ->shouldReceive('__invoke')
        ->once()
        ->andReturn($passkey);

    [$credential, $options] = fakePasskeyVerificationPayload();

    $response = $this->withSession(['passkey.verification_options' => $options])
        ->postJson(route('passkey.login'), ['credential' => $credential]);

    $response->assertOk()
        ->assertJson(['redirect' => url($dashboard)]);

    $this->assertAuthenticatedAs($user);
    $this->get($dashboard)->assertOk();
})->with([
    'superadmin' => ['superadmin', '/dashboard'],
    'protokol' => ['protokol', '/protokol'],
    'pimpinan' => ['pimpinan', '/leadership'],
]);

test('leadership accounts are blocked from logging in with passkey when their leader is deactivated', function () {
    $this->skipUnlessFortifyHas(Features::passkeys());

    $leader = Leader::factory()->create(['is_active' => false]);
    $user = User::factory()->pimpinan()->create(['leader_id' => $leader->id]);

    $passkey = new Passkey;
    $passkey->setRelation('user', $user);

    $this->mock(VerifyPasskey::class)
        ->shouldReceive('__invoke')
        ->once()
        ->andReturn($passkey);

    [$credential, $options] = fakePasskeyVerificationPayload();

    $response = $this->withSession(['passkey.verification_options' => $options])
        ->postJson(route('passkey.login'), ['credential' => $credential]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['credential' => Leader::DEACTIVATED_MESSAGE]);

    $this->assertGuest();
});
