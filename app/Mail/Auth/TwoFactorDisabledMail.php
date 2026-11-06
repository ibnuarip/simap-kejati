<?php

namespace App\Mail\Auth;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TwoFactorDisabledMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public string $logoUrl;

    public string $loginUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public User $user,
        public string $occurredAt,
    ) {
        $this->logoUrl = asset('images/logo-kejati.png');
        $this->loginUrl = route('login');
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Autentikasi Dua Faktor Dinonaktifkan — '.config('app.name'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.auth.two-factor-disabled',
            text: 'emails.auth.two-factor-disabled-text',
            with: [
                'appName' => config('app.name'),
                'loginUrl' => $this->loginUrl,
                'logoUrl' => $this->logoUrl,
                'occurredAt' => $this->occurredAt,
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
