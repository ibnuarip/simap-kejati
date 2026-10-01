<?php

namespace App\Services;

use App\Models\PushSubscription;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;
use Throwable;

class WebPushService
{
    private ?WebPush $webPush = null;

    public function __construct()
    {
        if (! $this->isConfigured()) {
            return;
        }

        $this->webPush = new WebPush([
            'VAPID' => [
                'subject' => config('services.webpush.subject'),
                'publicKey' => config('services.webpush.public_key'),
                'privateKey' => config('services.webpush.private_key'),
            ],
        ]);
    }

    public function isConfigured(): bool
    {
        return filled(config('services.webpush.public_key'))
            && filled(config('services.webpush.private_key'));
    }

    public function vapidPublicKey(): ?string
    {
        $key = config('services.webpush.public_key');

        return filled($key) ? (string) $key : null;
    }

    public function subscribe(array $subscription, ?string $name, User $user): PushSubscription
    {
        return PushSubscription::create([
            'user_id' => $user->id,
            'endpoint' => $subscription['endpoint'],
            'public_key' => $subscription['public_key'],
            'auth_secret' => $subscription['auth_secret'],
            'name' => $name,
            'user_agent' => $subscription['user_agent'] ?? null,
        ]);
    }

    public function unsubscribe(string $endpoint): int
    {
        return PushSubscription::where('endpoint', $endpoint)->delete();
    }

    /**
     * Kirim payload ke semua subscription milik user.
     *
     * @return int jumlah subscription yang berhasil dikirim
     */
    public function sendToUser(User $user, array $payload): int
    {
        $subscriptions = $user->pushSubscriptions()->get();

        if ($subscriptions->isEmpty()) {
            return 0;
        }

        return $this->sendToSubscriptions($subscriptions->all(), $payload);
    }

    /**
     * @param  array<int, PushSubscription|array{endpoint: string, public_key?: string, auth_secret?: string}>  $subscriptions
     */
    public function sendToSubscriptions(array $subscriptions, array $payload): int
    {
        if (empty($subscriptions) || ! $this->isConfigured() || $this->webPush === null) {
            return 0;
        }

        $payloadJson = json_encode($payload);

        if ($payloadJson === false) {
            Log::warning('WebPush: gagal encode payload.', ['payload' => $payload]);

            return 0;
        }

        foreach ($subscriptions as $subscription) {
            $this->webPush->queueNotification(
                $this->toSubscription($subscription),
                $payloadJson
            );
        }

        $sent = 0;

        try {
            foreach ($this->webPush->flush() as $report) {
                if ($report->isSuccess()) {
                    $sent++;

                    continue;
                }

                if ($report->isSubscriptionExpired()) {
                    PushSubscription::where('endpoint', $report->getEndpoint())->delete();
                } else {
                    Log::warning('WebPush: pengiriman gagal.', [
                        'endpoint' => $report->getEndpoint(),
                        'reason' => $report->getReason(),
                    ]);
                }
            }
        } catch (Throwable $e) {
            Log::error('WebPush: flush gagal.', ['message' => $e->getMessage()]);

            return $sent;
        }

        PushSubscription::whereIn(
            'endpoint',
            collect($subscriptions)->map(fn ($sub) => $sub instanceof PushSubscription ? $sub->endpoint : $sub['endpoint'])->all()
        )->update(['last_used_at' => now()]);

        return $sent;
    }

    /**
     * @param  PushSubscription|array{endpoint: string, public_key?: string, auth_secret?: string}  $subscription
     */
    private function toSubscription(PushSubscription|array $subscription): Subscription
    {
        if ($subscription instanceof PushSubscription) {
            return Subscription::create([
                'endpoint' => $subscription->endpoint,
                'publicKey' => $subscription->public_key,
                'authToken' => $subscription->auth_secret,
            ]);
        }

        return Subscription::create([
            'endpoint' => $subscription['endpoint'],
            'publicKey' => $subscription['public_key'] ?? null,
            'authToken' => $subscription['auth_secret'] ?? null,
        ]);
    }

    /**
     * @return array{title: string, body: string, icon: string, badge: string, vibrate: array<int, int>, data: array{url: string|null}}
     */
    public function generatePayload(string $title, string $body, ?string $agendaUrl = null): array
    {
        $icon = asset('android-chrome-192x192.png');

        return [
            'title' => $title,
            'body' => $body,
            'icon' => $icon,
            'badge' => $icon,
            'vibrate' => [100, 50, 100],
            'data' => [
                'url' => $agendaUrl,
            ],
        ];
    }
}
