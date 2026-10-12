<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class AvatarService
{
    public const DISK = 'avatars';

    public const MAX_KILOBYTES = 5120;

    /**
     * @return list<string>
     */
    public static function rules(): array
    {
        return ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:'.self::MAX_KILOBYTES];
    }

    /**
     * Simpan file baru dan hapus file lama. Mengembalikan path relatif.
     *
     * Folder target dibuat otomatis oleh Flysystem; filesystem disk memakai
     * opsi "throw" sehingga kegagalan tulis langsung menggelembung sebagai
     * exception, bukan diam-diam menghasilkan kolom avatar yang kosong.
     */
    public function store(User $user, UploadedFile $file): string
    {
        $this->delete($user);

        $path = $file->storeAs(
            '',
            Str::uuid()->toString().'.'.strtolower($file->extension() ?: 'jpg'),
            ['disk' => self::DISK]
        );

        if (! is_string($path)) {
            throw new RuntimeException('Gagal menyimpan foto profil.');
        }

        $user->forceFill(['avatar' => $path])->save();

        return $path;
    }

    /**
     * Hapus file avatar milik user (jika ada) dan kosongkan kolomnya.
     */
    public function delete(User $user): void
    {
        if (is_string($user->avatar) && $user->avatar !== '') {
            Storage::disk(self::DISK)->delete($user->avatar);
        }

        if ($user->avatar !== null) {
            $user->forceFill(['avatar' => null])->save();
        }
    }

    /**
     * Terapkan upload/penghapusan avatar dari request form.
     */
    public function syncFromRequest(User $user, Request $request): void
    {
        if ($request->boolean('remove_avatar')) {
            $this->delete($user);

            return;
        }

        $file = $request->file('avatar');

        if ($file instanceof UploadedFile && $file->isValid()) {
            $this->store($user, $file);
        }
    }
}
