<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use App\Services\WebPushService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PushNotificationController extends Controller
{
    public function __construct(
        private readonly WebPushService $webPush
    ) {}

    public function subscribe(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'endpoint' => 'required|string|max:500',
            'public_key' => 'required|string|max:500',
            'auth_secret' => 'required|string|max:500',
            'name' => 'nullable|string|max:255',
            'user_agent' => 'nullable|string|max:255',
        ]);

        $existing = PushSubscription::where('endpoint', $validated['endpoint'])->first();

        if ($existing) {
            $existing->update([
                'user_id' => $user->id,
                'public_key' => $validated['public_key'],
                'auth_secret' => $validated['auth_secret'],
                'name' => $validated['name'] ?? $existing->name,
                'user_agent' => $validated['user_agent'] ?? $existing->user_agent,
                'last_used_at' => now(),
            ]);
            $subscription = $existing;
        } else {
            $subscription = $this->webPush->subscribe([
                'endpoint' => $validated['endpoint'],
                'public_key' => $validated['public_key'],
                'auth_secret' => $validated['auth_secret'],
                'user_agent' => $validated['user_agent'] ?? null,
            ], $validated['name'] ?? null, $user);
        }

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi push terdaftar.',
            'subscription' => [
                'id' => $subscription->id,
                'endpoint' => $subscription->endpoint,
                'name' => $subscription->name,
            ],
        ]);
    }

    public function unsubscribe(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'endpoint' => 'required|string|max:500',
        ]);

        $deleted = $this->webPush->unsubscribe($validated['endpoint']);

        return response()->json([
            'success' => true,
            'message' => $deleted > 0 ? 'Berhasil berhenti berlangganan notifikasi.' : 'Subscription tidak ditemukan.',
        ]);
    }

    public function vapidKey(): JsonResponse
    {
        $publicKey = $this->webPush->vapidPublicKey();

        if (! $publicKey) {
            return response()->json(['error' => 'Web push belum dikonfigurasi.'], 503);
        }

        return response()->json(['publicKey' => $publicKey]);
    }

    public function status(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $subscriptions = $user->pushSubscriptions()
            ->select(['id', 'endpoint', 'name', 'user_agent', 'last_used_at', 'created_at'])
            ->get()
            ->map(fn ($sub) => [
                'id' => $sub->id,
                'endpoint' => $sub->endpoint,
                'name' => $sub->name,
                'user_agent' => $sub->user_agent,
                'last_used_at' => $sub->last_used_at?->toISOString(),
                'created_at' => $sub->created_at->toISOString(),
            ]);

        return response()->json([
            'subscriptions' => $subscriptions,
            'isSupported' => $this->isPushSupported(),
        ]);
    }

    private function isPushSupported(): bool
    {
        if (preg_match('~MSIE|Trident~', request()->header('User-Agent') ?? '')) {
            return false;
        }

        return true;
    }
}
