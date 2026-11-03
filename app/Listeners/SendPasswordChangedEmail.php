<?php

namespace App\Listeners;

use App\Concerns\SendsSecurityMail;
use App\Events\PasswordChanged;
use App\Mail\Auth\PasswordChangedMail;

class SendPasswordChangedEmail
{
    use SendsSecurityMail;

    /**
     * Handle the event.
     */
    public function handle(PasswordChanged $event): void
    {
        $this->sendSecurityMail(
            $event->user,
            new PasswordChangedMail(
                $event->user,
                now()->format('d/m/Y H:i'),
            ),
            'Gagal mengirim email perubahan kata sandi.',
        );
    }
}
