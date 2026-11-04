<?php

namespace App\Listeners;

use App\Concerns\SendsSecurityMail;
use App\Events\EmailChanged;
use App\Mail\Auth\EmailChangedMail;

class SendEmailChangedEmail
{
    use SendsSecurityMail;

    /**
     * Handle the event.
     */
    public function handle(EmailChanged $event): void
    {
        $this->sendSecurityMail(
            $event->user,
            new EmailChangedMail(
                $event->user,
                $event->oldEmail,
                $event->newEmail,
                now()->format('d/m/Y H:i'),
            ),
            'Gagal mengirim email perubahan alamat email.',
        );
    }
}
