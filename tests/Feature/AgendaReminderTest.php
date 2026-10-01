<?php

use App\Jobs\SendAgendaPushNotification;
use App\Models\AgendaReminderLog;
use App\Models\Event;
use App\Models\Leader;
use App\Models\PushSubscription;
use App\Models\User;
use App\Services\WebPushService;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Queue;

beforeEach(function () {
    // Command hanya butuh isConfigured(); pengiriman asli tidak pernah
    // terjadi karena Queue::fake. Mock ini membuat test independen dari
    // VAPID keys di environment (mis. CI yang memakai .env.example).
    // makePartial: method lain (subscribe/unsubscribe) tetap berjalan asli.
    $this->mock(WebPushService::class, function ($mock) {
        $mock->makePartial();
        $mock->shouldReceive('isConfigured')->andReturn(true);
    });
});

function createSubscribedKajati(array $reminderHours = ['1']): User
{
    $user = User::factory()->kajati()->create(['reminder_hours' => $reminderHours]);

    PushSubscription::factory()->create([
        'user_id' => $user->id,
    ]);

    return $user;
}

function createKajatiEvent(CarbonInterface $startTime): Event
{
    $leader = Leader::factory()->create(['position' => 'Kajati']);

    return Event::factory()->create([
        'leader_id' => $leader->id,
        'status' => 'scheduled',
        'start_time' => $startTime,
        'end_time' => $startTime->copy()->addHour(),
    ]);
}

test('reminder command queues a push job when due in the current minute', function () {
    Queue::fake();

    $user = createSubscribedKajati(['1']);
    $start = now(config('app.timezone'))->startOfMinute()->addHour();
    $event = createKajatiEvent($start);

    $this->artisan('agenda:process-reminders')->assertOk();

    Queue::assertPushed(SendAgendaPushNotification::class, function ($job) use ($user, $event) {
        return $job->userId === $user->id
            && str_contains($job->agenda['title'], $event->title)
            && $job->reminderHours === 1;
    });

    expect(AgendaReminderLog::where('agenda_id', $event->id)->where('user_id', $user->id)->exists())->toBeTrue();
});

test('reminder command does not send twice for the same reminder', function () {
    Queue::fake();

    createSubscribedKajati(['1']);
    $start = now(config('app.timezone'))->startOfMinute()->addHour();
    createKajatiEvent($start);

    $this->artisan('agenda:process-reminders')->assertOk();
    $this->artisan('agenda:process-reminders')->assertOk();

    Queue::assertPushed(SendAgendaPushNotification::class, 1);
});

test('reminder command skips users without push subscriptions', function () {
    Queue::fake();

    User::factory()->kajati()->create(['reminder_hours' => ['1']]);
    $start = now(config('app.timezone'))->startOfMinute()->addHour();
    createKajatiEvent($start);

    $this->artisan('agenda:process-reminders')->assertOk();

    Queue::assertNotPushed(SendAgendaPushNotification::class);
});

test('reminder command only notifies the matching leader position', function () {
    Queue::fake();

    $user = createSubscribedKajati(['1']);
    $wakajatiLeader = Leader::factory()->create(['position' => 'Wakajati']);
    $start = now(config('app.timezone'))->startOfMinute()->addHour();

    Event::factory()->create([
        'leader_id' => $wakajatiLeader->id,
        'status' => 'scheduled',
        'start_time' => $start,
        'end_time' => $start->copy()->addHour(),
    ]);

    $this->artisan('agenda:process-reminders')->assertOk();

    Queue::assertNotPushed(SendAgendaPushNotification::class);
    expect($user->fresh())->not->toBeNull();
});

test('leadership can subscribe and unsubscribe a push endpoint', function () {
    $user = User::factory()->kajati()->create();
    $endpoint = 'https://push.example.com/sub/browser-1';

    $this->actingAs($user)
        ->postJson(route('leadership.push.subscribe'), [
            'endpoint' => $endpoint,
            'public_key' => 'test-public-key',
            'auth_secret' => 'test-auth-secret',
            'name' => 'Perangkat Desktop',
        ])
        ->assertOk()
        ->assertJson(['success' => true]);

    expect(PushSubscription::where('endpoint', $endpoint)->where('user_id', $user->id)->exists())->toBeTrue();

    $this->actingAs($user)
        ->postJson(route('leadership.push.unsubscribe'), ['endpoint' => $endpoint])
        ->assertOk()
        ->assertJson(['success' => true]);

    expect(PushSubscription::where('endpoint', $endpoint)->exists())->toBeFalse();
});

test('reminder command skips everything when web push is not configured', function () {
    Queue::fake();

    $this->mock(WebPushService::class, function ($mock) {
        $mock->shouldReceive('isConfigured')->andReturn(false);
    });

    createSubscribedKajati(['1']);
    $start = now(config('app.timezone'))->startOfMinute()->addHour();
    createKajatiEvent($start);

    $this->artisan('agenda:process-reminders')->assertOk();

    Queue::assertNotPushed(SendAgendaPushNotification::class);
    expect(AgendaReminderLog::count())->toBe(0);
});
