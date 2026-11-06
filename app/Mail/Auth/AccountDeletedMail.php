<?php

namespace App\Mail\Auth;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Payload memakai data scalar, bukan model User, karena email diantrekan
 * setelah baris user terhapus (resolusi model pada job akan gagal).
 */
class AccountDeletedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public string $logoUrl;

    /**
     * Create a new message instance.
     *
     * @param  'self'|'admin'  $deletedBy
     */
    public function __construct(
        public string $name,
        public string $email,
        public string $roleLabel,
        public string $occurredAt,
        public string $deletedBy,
    ) {
        $this->logoUrl = asset('images/logo-kejati.png');
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Konfirmasi Penghapusan Akun — '.config('app.name'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.auth.account-deleted',
            text: 'emails.auth.account-deleted-text',
            with: [
                'appName' => config('app.name'),
                'name' => $this->name,
                'email' => $this->email,
                'roleLabel' => $this->roleLabel,
                'occurredAt' => $this->occurredAt,
                'deletedBy' => $this->deletedBy,
                'logoUrl' => $this->logoUrl,
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
