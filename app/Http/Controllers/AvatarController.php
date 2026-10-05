<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\AvatarService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

/**
 * Menyajikan foto profil. Privat: hanya pemilik akun yang login
 * yang boleh mengakses berkasnya sendiri.
 */
class AvatarController extends Controller
{
    public function __invoke(Request $request, User $user): Response
    {
        if ($request->user()?->getAuthIdentifier() !== $user->getKey()) {
            abort(403, 'Anda tidak memiliki akses ke foto ini.');
        }

        if (! is_string($user->avatar) || $user->avatar === '') {
            abort(404);
        }

        $disk = Storage::disk(AvatarService::DISK);

        if (! $disk->exists($user->avatar)) {
            abort(404);
        }

        // Selalu revalidasi agar foto yang baru diganti/dihapus langsung
        // terlihat tanpa harus hard refresh (ETag ditangani otomatis).
        return $disk->response($user->avatar, null, [
            'Cache-Control' => 'private, no-cache',
        ]);
    }
}
