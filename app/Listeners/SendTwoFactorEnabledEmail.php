<?php

namespace App\Listeners;

use App\Concerns\SendsSecurityMail;
use App\Mail\Auth\TwoFactorEnabledMail;
use Laravel\Fortify\Events\TwoFactorAuthenticationConfirmed;

class SendTwoFactorEnabledEmail
{
    use SendsSecurityMail;

    /**
     * Handle the event.
     */
    public function handle(TwoFactorAuthenticationConfirmed $event): void
    {
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
