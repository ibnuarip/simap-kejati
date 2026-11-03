<?php

namespace App\Listeners;

use App\Concerns\SendsSecurityMail;
use App\Mail\Auth\TwoFactorDisabledMail;
use App\Models\User;
use Laravel\Fortify\Events\TwoFactorAuthenticationDisabled;

class SendTwoFactorDisabledEmail
{
    use SendsSecurityMail;

    /**
     * Handle the event.
     */
    public function handle(TwoFactorAuthenticationDisabled $event): void
    {
        if (! $event->user instanceof User) {
            return;
        }

        $this->sendSecurityMail(
            $event->user,
            new TwoFactorDisabledMail(
                $event->user,
                now()->format('d/m/Y H:i'),
            ),
            'Gagal mengirim email penonaktifan autentikasi dua faktor.',
        );
    }
}
