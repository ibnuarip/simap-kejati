<?php

use App\Http\Middleware\EnsureLeaderActive;
use App\Http\Middleware\EnsureRole;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Responses\LoginResponse;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\ExceptionResponse;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Percayai header X-Forwarded-* dari reverse proxy / TLS terminator
        // (cloudflared tunnel, load balancer production). Tanpa ini, URL asset
        // dan deteksi HTTPS selalu memakai skema http origin.
        $middleware->trustProxies(at: '*');

        $middleware->alias([
            'role' => EnsureRole::class,
        ]);

        $middleware->redirectGuestsTo(fn () => route('login'));

        $middleware->redirectUsersTo(fn (Request $request) => LoginResponse::homeForRole($request->user()));

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            EnsureLeaderActive::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(function (ThrottleRequestsException $e, Request $request) {
            $retryAfter = max(1, (int) ($e->getHeaders()['Retry-After'] ?? 60));
            $message = "Terlalu banyak permintaan. Silakan tunggu {$retryAfter} detik sebelum mencoba kembali.";

            if ($request->expectsJson() || $request->header('X-Inertia')) {
                return response()->json([
                    'message' => $message,
                    'retry_after' => $retryAfter,
                ], 429, $e->getHeaders());
            }

            return null;
        });

        Inertia::handleExceptionsUsing(function (ExceptionResponse $response) {
            if ($response->request->expectsJson() && ! $response->request->header('X-Inertia')) {
                return $response;
            }

            if (in_array($response->statusCode(), [403, 404, 500, 503], true)) {
                return $response->render('error', [
                    'status' => $response->statusCode(),
                ]);
            }

            return $response;
        });
    })->create();
