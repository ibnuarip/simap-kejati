<?php

namespace App\Providers;

use App\Mail\Auth\ResetPasswordMail;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureTunnelAssets();
        $this->configureResetPasswordMail();
        $this->verifyEmailOnFirstLogin();
    }

    /**
     * Saat diakses melalui tunnel (mis. cloudflared *.trycloudflare.com dari HP),
     * abaikan public/hot (localhost:5173) dan gunakan hasil build statis di public/build
     * agar browser HP tidak gagal memuat script dari localhost.
     */
    protected function configureTunnelAssets(): void
    {
        if (app()->runningInConsole()) {
            return;
        }

        $request = request();
        $host = $request->getHost();
        $isLocalHost = in_array($host, ['localhost', '127.0.0.1'], true)
            || str_ends_with($host, '.test');

        if (! $isLocalHost) {
            Vite::useHotFile(storage_path('framework/vite.hot.disabled'));

            if ($request->header('X-Forwarded-Proto') === 'https' || $request->isSecure()) {
                URL::forceScheme('https');
            }
        }
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        // Nama hari/bulan berbahasa Indonesia untuk laporan dan dokumen.
        Carbon::setLocale('id');
        CarbonImmutable::setLocale('id');

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    /**
     * Send the branded password reset email instead of the default notification.
     */
    protected function configureResetPasswordMail(): void
    {
        ResetPassword::toMailUsing(function (User $notifiable, string $token) {
            $email = $notifiable->getEmailForPasswordReset();

            return (new ResetPasswordMail($token, $email))->to($email);
        });
    }

    /**
     * Mark an account verified after its first successful login.
     */
    protected function verifyEmailOnFirstLogin(): void
    {
        Event::listen(Login::class, function (Login $event): void {
            if ($event->user instanceof User && $event->user->email_verified_at === null) {
                $event->user->forceFill(['email_verified_at' => now()])->save();
            }
        });
    }
}
