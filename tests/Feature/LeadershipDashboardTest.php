<?php

use App\Models\Event;
use App\Models\Leader;
use App\Models\User;

test('pimpinan can access the leadership dashboard', function () {
    $user = User::factory()->pimpinan()->create();
    $this->actingAs($user);

    $this->get(route('leadership.dashboard'))->assertOk();
});

test('leadership can access calendar and notification pages', function () {
    $user = User::factory()->pimpinan()->create();
    $this->actingAs($user);

    foreach (['leadership.calendar.index', 'leadership.notifications.index'] as $route) {
        $this->get(route($route))->assertOk();
    }
});

test('non leadership roles are forbidden from leadership routes', function (string $role) {
    $user = User::factory()->create(['role' => $role]);
    $this->actingAs($user);

    $this->get(route('leadership.dashboard'))->assertForbidden();
})->with(['superadmin', 'protokol']);

test('leadership is redirected to their dashboard after login', function () {
    $user = User::factory()->pimpinan()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect('/leadership');
});

test('today events do not appear in the upcoming list', function () {
    $leader = Leader::factory()->create();
    $user = User::factory()->pimpinan()->create(['leader_id' => $leader->id]);
    $now = now(config('app.timezone'));

    $makeEvent = fn (string $title, $start, string $status = 'scheduled') => Event::factory()->create([
        'title' => $title,
        'leader_id' => $leader->id,
        'status' => $status,
        'start_time' => $start,
        'end_time' => $start->copy()->addHour(),
    ]);

    $todayEvent = $makeEvent('Agenda Hari Ini', $now->copy()->setTime(10, 0));
    $tomorrowEvent = $makeEvent('Agenda Besok', $now->copy()->addDay()->setTime(9, 0));
    $yesterdayEvent = $makeEvent('Agenda Kemarin', $now->copy()->subDay()->setTime(9, 0));
    $cancelledEvent = $makeEvent('Agenda Batal', $now->copy()->addDays(2)->setTime(9, 0), 'cancelled');

    $response = $this->actingAs($user)->get(route('leadership.dashboard'))->assertOk();

    $todayIds = collect($response->viewData('page')['props']['todayEvents'])->pluck('id')->all();
    $upcomingIds = collect($response->viewData('page')['props']['upcomingEvents'])->pluck('id')->all();

    expect($todayIds)->toContain($todayEvent->id);
    expect($upcomingIds)->toContain($tomorrowEvent->id);
    expect($upcomingIds)->not->toContain($todayEvent->id, $yesterdayEvent->id, $cancelledEvent->id);
    expect($todayIds)->not->toContain($tomorrowEvent->id);
    expect($upcomingIds)->toHaveCount(1);
});

test('pimpinan only sees their own agenda', function () {
    $leader = Leader::factory()->create();
    $user = User::factory()->pimpinan()->create(['leader_id' => $leader->id]);
    $otherLeader = Leader::factory()->create();

    $mine = Event::factory()->create(['leader_id' => $leader->id]);
    Event::factory()->create(['leader_id' => $otherLeader->id]);

    $response = $this->actingAs($user)->get(route('leadership.calendar.index'))->assertOk();

    $ids = collect($response->viewData('page')['props']['events'])->pluck('id')->all();

    expect($ids)->toBe([$mine->id]);
});
