<?php

namespace App\Listeners;

use App\Concerns\SendsSecurityMail;
use App\Mail\Auth\PasskeyAddedMail;
use App\Models\User;
use Laravel\Passkeys\Events\PasskeyRegistered;

class SendPasskeyAddedEmail
{
    use SendsSecurityMail;

    /**
     * Handle the event.
     */
    public function handle(PasskeyRegistered $event): void
    {
        if (! $event->user instanceof User) {
            return;
        }

        $this->sendSecurityMail(
            $event->user,
            new PasskeyAddedMail(
                $event->user,
                $event->passkey->name,
                now()->format('d/m/Y H:i'),
            ),
            'Gagal mengirim email penambahan passkey.',
        );
    }
}
