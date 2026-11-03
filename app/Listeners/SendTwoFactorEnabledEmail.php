<?php

namespace App\Listeners;

use App\Concerns\SendsSecurityMail;
use App\Mail\Auth\TwoFactorEnabledMail;
use App\Models\User;
use Laravel\Fortify\Events\TwoFactorAuthenticationConfirmed;

class SendTwoFactorEnabledEmail
{
    use SendsSecurityMail;

    /**
     * Handle the event.
     */
    public function handle(TwoFactorAuthenticationConfirmed $event): void
    {
        if (! $event->user instanceof User) {
            return;
        }

        $this->sendSecurityMail(
            $event->user,
            new TwoFactorEnabledMail(
                $event->user,
                now()->format('d/m/Y H:i'),
            ),
            'Gagal mengirim email pengaktifan autentikasi dua faktor.',
        );
    }
}
