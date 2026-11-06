<?php

namespace App\Mail\Auth;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ResetPasswordMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public string $logoUrl;

    public string $resetUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public string $token,
        public string $email,
    ) {
        $this->logoUrl = asset('images/logo-kejati.png');
        $this->resetUrl = route('password.reset', ['token' => $this->token, 'email' => $this->email]);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Atur Ulang Kata Sandi — '.config('app.name'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.auth.reset-password',
            text: 'emails.auth.reset-password-text',
            with: [
                'resetUrl' => $this->resetUrl,
                'logoUrl' => $this->logoUrl,
                'expiresInMinutes' => config('auth.passwords.users.expire', 60),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
