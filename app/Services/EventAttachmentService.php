<?php

namespace App\Services;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class EventAttachmentService
{
    public const DISK = 'event_attachments';

    public const MAX_KILOBYTES = 5120;

    /**
     * @return list<string>
     */
    public static function rules(): array
    {
        return ['nullable', 'file', 'mimes:pdf', 'max:'.self::MAX_KILOBYTES];
    }

    /**
     * Simpan berkas PDF baru dan hapus berkas lama (jika ada).
     */
    public function store(Event $event, UploadedFile $file): string
    {
        $this->delete($event);

        $path = $file->storeAs(
            '',
            Str::uuid()->toString().'.pdf',
            ['disk' => self::DISK]
        );

        if (! is_string($path)) {
            throw new RuntimeException('Gagal menyimpan lampiran PDF agenda.');
        }

        $originalName = trim($file->getClientOriginalName());
        if ($originalName === '' || ! str_ends_with(strtolower($originalName), '.pdf')) {
            $originalName = ($originalName !== '' ? $originalName : 'lampiran-agenda').'.pdf';
        }

        $event->forceFill([
            'attachment_path' => $path,
            'attachment_name' => Str::limit($originalName, 250, '.pdf'),
        ])->save();

        return $path;
    }

    /**
     * Hapus berkas PDF milik agenda (jika ada) dan kosongkan kolomnya.
     */
    public function delete(Event $event): void
    {
        if (is_string($event->attachment_path) && $event->attachment_path !== '') {
            Storage::disk(self::DISK)->delete($event->attachment_path);
        }

        if ($event->attachment_path !== null || $event->attachment_name !== null) {
            $event->forceFill([
                'attachment_path' => null,
                'attachment_name' => null,
            ])->save();
        }
    }

    /**
     * Terapkan unggahan atau penghapusan lampiran PDF dari form request.
     */
    public function syncFromRequest(Event $event, Request $request): void
    {
        if ($request->boolean('remove_attachment')) {
            $this->delete($event);

            return;
        }

        $file = $request->file('attachment');

        if ($file instanceof UploadedFile && $file->isValid()) {
            $this->store($event, $file);
        }
    }
}
