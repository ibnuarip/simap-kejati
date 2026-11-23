<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\User;
use App\Services\EventAttachmentService;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

/**
 * Menyajikan berkas lampiran PDF agenda secara privat sesuai kewenangan peran.
 */
class EventAttachmentController extends Controller
{
    public function __invoke(Request $request, Event $event): Response
    {
        $user = $request->user();

        if (! $user instanceof User || ! $this->canAccess($user, $event)) {
            abort(403, 'Anda tidak memiliki akses ke lampiran agenda ini.');
        }

        if (! is_string($event->attachment_path) || $event->attachment_path === '') {
            abort(404);
        }

        /** @var FilesystemAdapter $disk */
        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk(EventAttachmentService::DISK);

        if (! $disk->exists($event->attachment_path)) {
            abort(404);
        }

        $filename = is_string($event->attachment_name) && $event->attachment_name !== ''
            ? $event->attachment_name
            : 'lampiran-agenda.pdf';

        return $disk->response($event->attachment_path, $filename, [
            'Content-Type' => 'application/pdf',
            'Cache-Control' => 'private, no-cache',
        ]);
    }

    protected function canAccess(User $user, Event $event): bool
    {
        if ($user->isSuperadmin()) {
            return true;
        }

        if ($user->isProtokol()) {
            return in_array($event->leader_id, $user->assignedLeaderIds(), true);
        }

        if ($user->isPimpinan()) {
            return $user->leader_id !== null && (int) $user->leader_id === (int) $event->leader_id;
        }

        return false;
    }
}
