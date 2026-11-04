<?php

namespace App\Listeners;

use App\Concerns\SendsSecurityMail;
use App\Mail\Auth\PasskeyRemovedMail;
use App\Models\User;
use Laravel\Passkeys\Events\PasskeyDeleted;

class SendPasskeyDeletedEmail
{
    use SendsSecurityMail;

    /**
     * Handle the event.
     */
    public function handle(PasskeyDeleted $event): void
    {
        if (! $event->user instanceof User) {
            return;
        }

        $this->sendSecurityMail(
            $event->user,
            new PasskeyRemovedMail(
                $event->user,
                $event->passkey->name,
                now()->format('d/m/Y H:i'),
            ),
            'Gagal mengirim email penghapusan passkey.',
        );
    }
}
