<?php

namespace App\Listeners;

use App\Concerns\SendsSecurityMail;
use App\Events\AccountDeleted;
use App\Mail\Auth\AccountDeletedMail;

class SendAccountDeletedEmail
{
    use SendsSecurityMail;

    /**
     * Handle the event.
     */
    public function handle(AccountDeleted $event): void
    {
        $user = $event->user;

        if (! in_array($user->role, ['protokol', 'pimpinan'], true)) {
            return;
        }

        $roleLabel = $user->role === 'protokol' ? 'Protokol' : 'Pimpinan';

        $this->sendSecurityMail(
            $user,
            new AccountDeletedMail(
                $user->name,
                $user->email,
                $roleLabel,
                now()->format('d/m/Y H:i'),
                $event->deletedBy,
            ),
            'Gagal mengirim email konfirmasi penghapusan akun.',
        );
    }
}
