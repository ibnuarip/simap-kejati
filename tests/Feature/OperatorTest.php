<?php

use App\Mail\Auth\AccountCredentialsMail;
use App\Mail\Auth\WelcomeMail;
use App\Models\Category;
use App\Models\Event;
use App\Models\Leader;
use App\Models\Room;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;

function makeOperator(): User
{
    return User::factory()->operator()->create();
}

test('dashboard renders stats and recent activity for operators', function () {
    $operator = makeOperator();
    $this->actingAs($operator);

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('stats')
            ->has('recentEvents')
            ->has('upcomingEvents')
            ->has('eventsTrend')
            ->has('categoryDistribution'));
});

test('dashboard provides trend and category distribution data for charts', function () {
    $operator = makeOperator();
    $this->actingAs($operator);

    $category = Category::factory()->create(['name' => 'Audiensi', 'color' => '#3B82F6']);
    $otherCategory = Category::factory()->create(['name' => 'Kunjungan Kerja']);

    $year = now()->format('Y');
    Event::factory()->create(['category_id' => $category->id, 'created_at' => "{$year}-01-15 10:00:00"]);
    Event::factory()->create(['category_id' => $category->id, 'created_at' => "{$year}-03-10 10:00:00"]);
    Event::factory()->create(['category_id' => $otherCategory->id, 'created_at' => "{$year}-03-20 10:00:00"]);

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('eventsTrend', 12)
            ->where('eventsTrend.0.month', "{$year}-01")
            ->where('eventsTrend.0.label', 'Jan')
            ->where('eventsTrend.0.total', 1)
            ->where('eventsTrend.1.total', 0)
            ->where('eventsTrend.2.total', 2)
            ->where('eventsTrend.11.month', "{$year}-12")
            ->where('eventsTrend.11.label', 'Des')
            ->where('categoryDistribution.0.name', 'Audiensi')
            ->where('categoryDistribution.0.color', '#3B82F6')
            ->where('categoryDistribution.1.name', 'Kunjungan Kerja'));
});

test('operators can create a leader', function () {
    $operator = makeOperator();
    $this->actingAs($operator);

    $this->post(route('master.leaders.store'), [
        'name' => 'Drs. H. Bambang',
        'position' => 'Kajati',
        'nip' => '198001012010011001',
        'email' => 'kajati@kejati.go.id',
        'phone' => '081234567890',
        'is_active' => '1',
    ])->assertRedirect();

    $this->assertDatabaseHas('leaders', [
        'name' => 'Drs. H. Bambang',
        'position' => 'Kajati',
        'email' => 'kajati@kejati.go.id',
    ]);
});

test('leader phone must start with 08 and be 10 to 14 digits', function () {
    $operator = makeOperator();
    $this->actingAs($operator);

    $payload = [
        'name' => 'Drs. H. Bambang',
        'position' => 'Kajati',
        'is_active' => '1',
    ];

    foreach (['123', '0712345678', '08123456789012345', '08abc12345'] as $phone) {
        $this->post(route('master.leaders.store'), [...$payload, 'phone' => $phone])
            ->assertSessionHasErrors('phone');
    }

    $this->post(route('master.leaders.store'), [...$payload, 'phone' => '081234567890'])
        ->assertSessionHasNoErrors();
});

test('leader position other than kajati or wakajati is rejected', function () {
    $operator = makeOperator();
    $this->actingAs($operator);

    $this->post(route('master.leaders.store'), [
        'name' => 'Drs. H. Bambang',
        'position' => 'Other',
        'is_active' => '1',
    ])->assertSessionHasErrors('position');

    expect(Leader::where('position', 'Other')->exists())->toBeFalse();
});

test('creating a leader requires a name and a valid position', function () {
    $operator = makeOperator();
    $this->actingAs($operator);

    $this->post(route('master.leaders.store'), [])->assertSessionHasErrors([
        'name',
        'position',
    ]);

    $this->post(route('master.leaders.store'), [
        'name' => 'Tanpa Jabatan',
        'position' => 'Direktur',
    ])->assertSessionHasErrors('position');

    $this->assertDatabaseCount('leaders', 0);
});

test('a leader nip must be exactly 18 digits', function (string $nip) {
    $operator = makeOperator();
    $this->actingAs($operator);

    $this->post(route('master.leaders.store'), [
        'name' => 'Drs. H. Bambang',
        'position' => 'Kajati',
        'nip' => $nip,
        'is_active' => '1',
    ])->assertSessionHasErrors('nip');

    $this->assertDatabaseCount('leaders', 0);
})->with([
    'too short' => ['19800101201001100'],
    'too long' => ['1980010120100110012'],
    'contains letters' => ['19800101201001A001'],
    'formatted with spaces' => ['19800101 199503 1 001'],
]);

test('operators can update and delete a leader', function () {
    $operator = makeOperator();
    $leader = Leader::factory()->create();

    $this->actingAs($operator);

    $this->patch(route('master.leaders.update', $leader), [
        'name' => 'Dr. H. Siti',
        'position' => 'Wakajati',
        'is_active' => '0',
    ])->assertRedirect();

    $this->assertDatabaseHas('leaders', [
        'id' => $leader->id,
        'name' => 'Dr. H. Siti',
        'position' => 'Wakajati',
        'is_active' => 0,
    ]);

    $this->delete(route('master.leaders.destroy', $leader))->assertRedirect();

    $this->assertDatabaseMissing('leaders', ['id' => $leader->id]);
});

test('operators can create and delete a room', function () {
    $operator = makeOperator();
    $this->actingAs($operator);

    $this->post(route('master.rooms.store'), [
        'name' => 'Ruang Sidang Utama',
        'location' => 'Gedung Utama Lantai 3',
        'capacity' => 80,
        'is_active' => '1',
    ])->assertRedirect();

    $this->assertDatabaseHas('rooms', [
        'name' => 'Ruang Sidang Utama',
        'capacity' => 80,
    ]);

    $room = Room::where('name', 'Ruang Sidang Utama')->firstOrFail();

    $this->delete(route('master.rooms.destroy', $room))->assertRedirect();

    $this->assertDatabaseMissing('rooms', ['id' => $room->id]);
});

test('operators can create, update, and delete a category', function () {
    $operator = makeOperator();
    $this->actingAs($operator);

    $this->post(route('master.categories.store'), [
        'name' => 'Rapat Pimpinan',
        'color' => '#008752',
        'description' => 'Kegiatan internal pimpinan',
    ])->assertRedirect();

    $category = Category::where('name', 'Rapat Pimpinan')->firstOrFail();
    $this->assertDatabaseHas('categories', ['id' => $category->id, 'color' => '#008752']);

    $this->patch(route('master.categories.update', $category), [
        'name' => 'Rapat Pleno',
        'color' => '#0000FF',
        'description' => null,
    ])->assertRedirect();

    $this->assertDatabaseHas('categories', [
        'id' => $category->id,
        'name' => 'Rapat Pleno',
        'color' => '#0000FF',
    ]);

    $this->delete(route('master.categories.destroy', $category))->assertRedirect();

    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});

test('operators can create a user with a given role and password', function () {
    Mail::fake();

    $operator = makeOperator();
    $this->actingAs($operator);

    $this->post(route('users.store'), [
        'name' => 'Budi Santoso',
        'email' => 'budi@kejati.go.id',
        'role' => 'kajati',
        'password' => 'rahasia1234',
    ])->assertRedirect();

    $this->assertDatabaseHas('users', [
        'email' => 'budi@kejati.go.id',
        'role' => 'kajati',
    ]);

    $user = User::where('email', 'budi@kejati.go.id')->firstOrFail();

    expect(Hash::check('rahasia1234', $user->password))->toBeTrue();
    expect($user->email_verified_at)->toBeNull();

    Mail::assertSent(WelcomeMail::class, fn (WelcomeMail $mail) => $mail->hasTo('budi@kejati.go.id'));
    Mail::assertSent(AccountCredentialsMail::class, function (AccountCredentialsMail $mail) {
        return $mail->hasTo('budi@kejati.go.id') && $mail->password === 'rahasia1234';
    });
});

test('a newly created account becomes verified after its first successful login', function () {
    $user = User::factory()->unverified()->create(['password' => 'rahasia1234']);

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'rahasia1234',
    ]);

    $this->assertAuthenticated();
    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('creating a user requires a password', function () {
    $operator = makeOperator();
    $this->actingAs($operator);

    $this->post(route('users.store'), [
        'name' => 'Tanpa Password',
        'email' => 'abc@kejati.go.id',
        'role' => 'operator',
    ])->assertSessionHasErrors('password');

    $this->assertDatabaseMissing('users', ['email' => 'abc@kejati.go.id']);
});

test('operators can update a user password and role', function () {
    $operator = makeOperator();
    $user = User::factory()->operator()->create();

    $this->actingAs($operator);

    $this->patch(route('users.update', $user), [
        'name' => $user->name,
        'email' => $user->email,
        'role' => 'protokol',
        'password' => 'passwordbaru123',
    ])->assertRedirect();

    $user->refresh();
    $this->assertDatabaseHas('users', ['id' => $user->id, 'role' => 'protokol']);

    expect(Hash::check('passwordbaru123', $user->password))->toBeTrue();
});

test('updating a user without a password keeps the existing password', function () {
    $operator = makeOperator();
    $user = User::factory()->operator()->create();
    $originalPassword = $user->password;

    $this->actingAs($operator);

    $this->patch(route('users.update', $user), [
        'name' => 'Nama Baru',
        'email' => 'ringkas@kejati.go.id',
        'role' => $user->role,
    ])->assertRedirect();

    $user->refresh();

    expect($user->password)->toBe($originalPassword)
        ->and($user->name)->toBe('Nama Baru');
});

test('operators cannot delete their own account', function () {
    $operator = makeOperator();
    $this->actingAs($operator);

    $this->delete(route('users.destroy', $operator))->assertForbidden();

    $this->assertModelExists($operator);
});

test('operators can delete another user', function () {
    $operator = makeOperator();
    $other = User::factory()->protokol()->create();

    $this->actingAs($operator);

    $this->delete(route('users.destroy', $other))->assertRedirect();

    $this->assertDatabaseMissing('users', ['id' => $other->id]);
});

test('operators can create an event linked to master data', function () {
    $operator = makeOperator();
    $leader = Leader::factory()->create();
    $room = Room::factory()->create();
    $category = Category::factory()->create();

    $start = now()->addDay()->setTime(9, 0);
    $end = $start->copy()->addHours(2);

    $this->actingAs($operator);

    $this->post(route('events.store'), [
        'title' => 'Rapat Koordinasi Pimpinan',
        'description' => 'Membahas agenda bulanan.',
        'leader_id' => $leader->id,
        'room_id' => $room->id,
        'category_id' => $category->id,
        'custom_location' => null,
        'start_time' => $start->toDateTimeString(),
        'end_time' => $end->toDateTimeString(),
        'dress_code' => 'PDH',
        'participants' => 'Para asisten',
    ])->assertRedirect();

    $this->assertDatabaseHas('events', [
        'title' => 'Rapat Koordinasi Pimpinan',
        'leader_id' => $leader->id,
        'room_id' => $room->id,
        'category_id' => $category->id,
        'status' => 'scheduled',
        'created_by' => $operator->id,
    ]);
});

test('creating an event requires a leader and a valid time window', function () {
    $operator = makeOperator();
    $this->actingAs($operator);

    $this->post(route('events.store'), [
        'title' => 'Agenda Tanpa Pimpinan',
    ])->assertSessionHasErrors(['leader_id', 'start_time', 'end_time']);

    $this->assertDatabaseCount('events', 0);
});

test('an event must end after it starts', function () {
    $operator = makeOperator();
    $leader = Leader::factory()->create();

    $this->actingAs($operator);

    $this->post(route('events.store'), [
        'title' => 'Waktu Terbalik',
        'leader_id' => $leader->id,
        'start_time' => now()->addDay()->setTime(9, 0)->toDateTimeString(),
        'end_time' => now()->addDay()->setTime(8, 0)->toDateTimeString(),
    ])->assertSessionHasErrors('end_time');

    $this->assertDatabaseCount('events', 0);
});

test('operators can update and delete an event', function () {
    $operator = makeOperator();
    $event = Event::factory()->create();

    $this->actingAs($operator);

    $this->patch(route('events.update', $event), [
        'title' => $event->title,
        'description' => $event->description,
        'leader_id' => $event->leader_id,
        'room_id' => $event->room_id,
        'category_id' => $event->category_id,
        'custom_location' => $event->custom_location,
        'start_time' => $event->start_time->toDateTimeString(),
        'end_time' => $event->end_time->toDateTimeString(),
        'dress_code' => $event->dress_code,
        'participants' => $event->participants,
    ])->assertRedirect();

    $this->assertDatabaseHas('events', [
        'id' => $event->id,
        'status' => $event->status,
    ]);

    $this->delete(route('events.destroy', $event))->assertRedirect();

    $this->assertDatabaseMissing('events', ['id' => $event->id]);
});

test('agenda lists are ordered newest first', function (string $route, string $role) {
    $user = User::factory()->create(['role' => $role]);

    $older = Event::factory()->create([
        'start_time' => now()->subDays(3)->setTime(9, 0),
        'end_time' => now()->subDays(3)->setTime(11, 0),
    ]);

    $newer = Event::factory()->create([
        'start_time' => now()->subDay()->setTime(9, 0),
        'end_time' => now()->subDay()->setTime(11, 0),
    ]);

    $this->actingAs($user);

    $this->get(route($route))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('events.0.id', $newer->id)
            ->where('events.1.id', $older->id));
})->with([
    'operator' => ['events.index', 'operator'],
    'protokol' => ['protokol.events.index', 'protokol'],
]);

test('operator write routes are forbidden to other roles', function (string $route, array $payload) {
    $protokol = User::factory()->protokol()->create();
    $this->actingAs($protokol);

    $this->post(route($route), $payload)->assertForbidden();
})->with([
    'master.leaders.store' => ['master.leaders.store', ['name' => 'Dilarang']],
    'master.rooms.store' => ['master.rooms.store', ['name' => 'Dilarang']],
    'master.categories.store' => ['master.categories.store', ['name' => 'Dilarang']],
    'users.store' => ['users.store', ['name' => 'Dilarang', 'email' => 'x@y.z', 'role' => 'operator', 'password' => 'rahasia1234']],
    'events.store' => ['events.store', ['title' => 'Dilarang']],
]);

test('guest write requests are redirected to login', function (string $route, array $payload) {
    $this->post(route($route), $payload)->assertRedirect(route('login'));
})->with([
    'master.leaders.store' => ['master.leaders.store', ['name' => 'Anonim']],
    'users.store' => ['users.store', ['name' => 'Anonim', 'email' => 'anon@kejati.go.id', 'role' => 'operator', 'password' => 'rahasia1234']],
    'events.store' => ['events.store', ['title' => 'Anonim']],
]);
