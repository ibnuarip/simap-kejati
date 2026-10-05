<?php

use App\Models\User;
use App\Services\AvatarService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake(AvatarService::DISK);
});

function avatarFile(): UploadedFile
{
    return UploadedFile::fake()->image('foto.jpg', 200, 200);
}

test('operator can create a user with an avatar', function () {
    $operator = User::factory()->operator()->create();
    $this->actingAs($operator);

    $this->post(route('users.store'), [
        'name' => 'Petugas Baru',
        'email' => 'baru@kejati.go.id',
        'role' => 'protokol',
        'password' => 'password123',
        'avatar' => avatarFile(),
    ])->assertSessionHasNoErrors();

    $user = User::where('email', 'baru@kejati.go.id')->firstOrFail();

    expect($user->avatar)->not->toBeNull();
    Storage::disk(AvatarService::DISK)->assertExists($user->avatar);
});

test('operator updating avatar replaces the old file', function () {
    $operator = User::factory()->operator()->create();
    $user = User::factory()->protokol()->create();
    $this->actingAs($operator);

    $this->patch(route('users.update', $user), [
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->role,
        'avatar' => avatarFile(),
    ])->assertSessionHasNoErrors();

    $first = $user->fresh()->avatar;

    $this->patch(route('users.update', $user), [
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->role,
        'avatar' => avatarFile(),
    ])->assertSessionHasNoErrors();

    expect($user->fresh()->avatar)->not->toBe($first);
    Storage::disk(AvatarService::DISK)->assertMissing($first);
});

test('operator can remove an avatar', function () {
    $operator = User::factory()->operator()->create();
    $user = User::factory()->protokol()->create();
    $this->actingAs($operator);

    $this->patch(route('users.update', $user), [
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->role,
        'avatar' => avatarFile(),
    ]);

    $path = $user->fresh()->avatar;
    expect($path)->not->toBeNull();

    $this->patch(route('users.update', $user), [
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->role,
        'remove_avatar' => '1',
    ])->assertSessionHasNoErrors();

    expect($user->fresh()->avatar)->toBeNull();
    Storage::disk(AvatarService::DISK)->assertMissing($path);
});

test('avatar upload rejects non image files in indonesian', function () {
    $operator = User::factory()->operator()->create();
    $this->actingAs($operator);

    $this->post(route('users.store'), [
        'name' => 'Petugas Baru',
        'email' => 'baru@kejati.go.id',
        'role' => 'protokol',
        'password' => 'password123',
        'avatar' => UploadedFile::fake()->create('dokumen.pdf', 100, 'application/pdf'),
    ])->assertSessionHasErrors('avatar');
});

test('user can update their own avatar from profile settings', function () {
    $user = User::factory()->protokol()->create();
    $this->actingAs($user);

    $this->patch(route('profile.update'), [
        'name' => $user->name,
        'email' => $user->email,
        'avatar' => avatarFile(),
    ])->assertSessionHasNoErrors();

    expect($user->fresh()->avatar)->not->toBeNull();
});

test('avatar file is only accessible by its owner', function () {
    $owner = User::factory()->protokol()->create();
    $other = User::factory()->protokol()->create();

    $path = UploadedFile::fake()->image('foto.jpg')->storeAs('', 'milik-owner.jpg', ['disk' => AvatarService::DISK]);
    $owner->forceFill(['avatar' => $path])->save();

    // Tamu dialihkan ke login.
    $this->get(route('avatar.show', $owner))->assertRedirect(route('login'));

    // Bukan pemilik: 403 walau sudah login.
    $this->actingAs($other)->get(route('avatar.show', $owner))->assertForbidden();

    // Pemilik: 200.
    $this->actingAs($owner)->get(route('avatar.show', $owner))->assertOk();

    // Tanpa avatar: 404.
    $this->actingAs($other)->get(route('avatar.show', $other))->assertNotFound();
});

test('deleting a user removes its avatar file', function () {
    $operator = User::factory()->operator()->create();
    $user = User::factory()->protokol()->create();
    $this->actingAs($operator);

    $this->patch(route('users.update', $user), [
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->role,
        'avatar' => avatarFile(),
    ]);

    $path = $user->fresh()->avatar;

    $this->delete(route('users.destroy', $user))->assertRedirect();

    Storage::disk(AvatarService::DISK)->assertMissing($path);
});
