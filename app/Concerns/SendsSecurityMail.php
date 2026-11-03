<?php

namespace App\Concerns;

use App\Models\User;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

trait SendsSecurityMail
{
    /**
     * Kirim email keamanan tanpa menggagalkan request aslinya jika pengiriman gagal.
     */
    protected function sendSecurityMail(User $user, Mailable $mail, string $failureContext): void
    {
        try {
            Mail::to($user)->send($mail);
        } catch (Throwable $e) {
            Log::error($failureContext, [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
