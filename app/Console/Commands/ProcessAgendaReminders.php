<?php

namespace App\Console\Commands;

use App\Jobs\SendAgendaPushNotification;
use App\Models\AgendaReminderLog;
use App\Models\Event;
use App\Models\User;
use App\Services\WebPushService;
use Carbon\CarbonInterface;
use Illuminate\Console\Command;

class ProcessAgendaReminders extends Command
{
    protected $signature = 'agenda:process-reminders';

    protected $description = 'Process agenda reminders that are due in the current minute and dispatch push notifications via queue.';

    public function handle(WebPushService $webPush): int
    {
        if (! $webPush->isConfigured()) {
            $this->warn('VAPID keys belum dikonfigurasi, pengiriman push dilewati.');

            return 0;
        }

        $this->info('Processing agenda reminders...');

        $now = now(config('app.timezone'));
        $windowStart = $now->copy()->startOfMinute();

        $this->line("Checking reminders for minute: {$windowStart->format('Y-m-d H:i')}");

        $leadershipUsers = User::whereIn('role', ['kajati', 'wakajati'])
            ->whereNotNull('reminder_hours')
            ->get();

        $totalDispatched = 0;

        foreach ($leadershipUsers as $user) {
            $reminderHours = array_filter(
                array_map(intval(...), (array) $user->reminder_hours),
                fn (int $hours) => $hours > 0
            );

            if (empty($reminderHours)) {
                continue;
            }

            if ($user->pushSubscriptions()->doesntExist()) {
                $this->line("  [{$user->email}] No push subscriptions");

                continue;
            }

            $agendas = Event::query()
                ->with('leader')
                ->whereHas('leader', fn ($query) => $query->where('position', $this->positionForRole($user->role)))
                ->where('status', 'scheduled')
                ->where('start_time', '>', $now)
                ->orderBy('start_time')
                ->get();

            foreach ($agendas as $agenda) {
                foreach ($reminderHours as $hours) {
                    $remindAt = $agenda->start_time->copy()->subHours($hours)->startOfMinute();

                    // Tepat waktu: jendela pengingat jatuh pada menit ini.
                    $isDue = $remindAt->equalTo($windowStart);

                    // Susulan: jendela sudah lewat (mis. agenda dibuat mepet
                    // setelah jendelanya tiba), selama agenda belum dimulai.
                    // Ganda dicegah oleh log per jendela di bawah.
                    $isMissed = ! $isDue && $remindAt->lessThan($windowStart);

                    if (! $isDue && ! $isMissed) {
                        continue;
                    }

                    if ($this->isAlreadySent($agenda, $user, $remindAt)) {
                        continue;
                    }

                    $this->logReminder($agenda, $user, $remindAt);

                    SendAgendaPushNotification::dispatch(
                        $user->id,
                        [
                            'title' => $agenda->title,
                            'start_time' => $agenda->start_time->format('H:i'),
                            'start_at' => $agenda->start_time->format('Y-m-d H:i:s'),
                        ],
                        $hours,
                    );

                    $totalDispatched++;
                    $kind = $isDue ? 'Queued reminder' : 'Queued catch-up reminder';
                    $this->line("  [{$user->email}] {$kind} for: {$agenda->title} ({$hours}j before)");
                }
            }
        }

        $this->info("Total notifications queued: {$totalDispatched}");

        return 0;
    }

    private function positionForRole(?string $role): string
    {
        return $role === 'wakajati' ? 'Wakajati' : 'Kajati';
    }

    private function isAlreadySent(Event $agenda, User $user, CarbonInterface $remindAt): bool
    {
        return AgendaReminderLog::where('agenda_id', $agenda->id)
            ->where('user_id', $user->id)
            ->where('remind_at', $remindAt)
            ->exists();
    }

    private function logReminder(Event $agenda, User $user, CarbonInterface $remindAt): void
    {
        AgendaReminderLog::create([
            'agenda_id' => $agenda->id,
            'user_id' => $user->id,
            'remind_at' => $remindAt,
            'sent_at' => now(config('app.timezone')),
        ]);
    }
}
