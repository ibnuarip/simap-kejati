<?php

namespace App\Providers;

use App\Mail\Auth\ResetPasswordMail;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
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
        $this->configureResetPasswordMail();
        $this->verifyEmailOnFirstLogin();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

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
