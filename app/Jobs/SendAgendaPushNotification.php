<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\WebPushService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendAgendaPushNotification implements ShouldQueue
{
    use Queueable;

    /**
     * @param  array{title: string, start_time: string}  $agenda
     */
    public function __construct(
        public int $userId,
        public array $agenda,
        public int $reminderHours,
    ) {}

    public function handle(WebPushService $webPush): void
    {
        $user = User::query()->find($this->userId);

        if (! $user) {
            return;
        }

        $payload = $webPush->generatePayload(
            'Pengingat Agenda',
            "{$this->agenda['title']} dimulai {$this->reminderHours} jam lagi (pukul {$this->agenda['start_time']} WIB)",
            '/leadership/calendar'
        );

        $webPush->sendToUser($user, $payload);
    }
}
