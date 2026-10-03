<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\WebPushService;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class SendAgendaPushNotification implements ShouldQueue
{
    use Queueable;

    /**
     * @param  array{title: string, start_time: string, start_at?: string}  $agenda
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

        $timezone = (string) config('app.timezone');
        $now = CarbonImmutable::now($timezone);
        $start = isset($this->agenda['start_at'])
            ? CarbonImmutable::parse($this->agenda['start_at'], $timezone)
            : $this->resolveStart($timezone);

        // Agenda keburu dimulai saat job dieksekusi (mis. antrean
        // tertunda) — jangan kirim pengingat basi.
        if ($start === null || $now->greaterThanOrEqualTo($start)) {
            return;
        }

        $payload = $webPush->generatePayload(
            'Pengingat Agenda',
            "{$this->agenda['title']} dimulai {$this->remainingText($now, $start)} lagi (pukul {$this->agenda['start_time']} WIB)",
            '/leadership/calendar'
        );

        $webPush->sendToUser($user, $payload);
    }

    /**
     * Waktu mulai sebenarnya. Payload hanya membawa jam (H:i) agar tetap
     * kompatibel, sehingga tanggalnya direkonstruksi: hari ini bila masih
     * di depan, atau besok pagi. Null bila keduanya sudah lewat.
     */
    private function resolveStart(string $timezone): ?CarbonImmutable
    {
        $now = CarbonImmutable::now($timezone);

        try {
            $time = CarbonImmutable::createFromFormat('H:i', $this->agenda['start_time'], $timezone);
        } catch (Throwable) {
            return null;
        }

        $today = $time->setDate($now->year, $now->month, $now->day);

        if ($today->greaterThan($now)) {
            return $today;
        }

        $tomorrow = $today->addDay();

        return $tomorrow->greaterThan($now) ? $tomorrow : null;
    }

    private function remainingText(CarbonImmutable $now, CarbonImmutable $start): string
    {
        $minutes = max(1, (int) $now->diffInMinutes($start));

        if ($minutes < 60) {
            return "{$minutes} menit";
        }

        $hours = intdiv($minutes, 60);
        $rest = $minutes % 60;

        return $rest > 0 ? "{$hours} jam {$rest} menit" : "{$hours} jam";
    }
}
