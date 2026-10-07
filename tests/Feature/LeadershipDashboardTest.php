<?php

use App\Models\Event;
use App\Models\Leader;
use App\Models\User;

test('kajati can access the leadership dashboard', function () {
    $user = User::factory()->kajati()->create();
    $this->actingAs($user);

    $this->get(route('leadership.dashboard'))->assertOk();
});

test('wakajati can access the leadership dashboard', function () {
    $user = User::factory()->wakajati()->create();
    $this->actingAs($user);

    $this->get(route('leadership.dashboard'))->assertOk();
});

test('leadership can access calendar and notification pages', function () {
    $user = User::factory()->kajati()->create();
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

test('leadership is redirected to their dashboard after login', function (string $role) {
    $user = User::factory()->create(['role' => $role]);

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect('/leadership');
})->with(['kajati', 'wakajati']);

test('today events do not appear in the upcoming list', function () {
    $user = User::factory()->kajati()->create();
    $leader = Leader::factory()->create(['position' => 'Kajati']);
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
