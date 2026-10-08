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

    public const MAX_KILOBYTES = 2048;

    /**
     * @return list<string>
     */
    public static function rules(): array
    {
        return ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:'.self::MAX_KILOBYTES];
    }

    /**
     * Simpan file baru dan hapus file lama. Mengembalikan path relatif.
     * Pastikan folder target ada dan permission benar.
     */
    public function store(User $user, UploadedFile $file): string
    {
        $this->delete($user);

        // Pastikan folder avatar ada dan permission write
        $disk = Storage::disk(self::DISK);
        $root = $disk->root();

        if (! is_dir($root)) {
            @mkdir($root, 0755, true);
            @chmod($root, 0755);
        }

        // Set permission folder induk
        $parent = dirname($root);
        if (is_dir($parent)) {
            @chmod($parent, 0755);
        }

        $path = $file->storeAs(
            '',
            Str::uuid()->toString().'.'.$file->getClientOriginalExtension(),
            ['disk' => self::DISK]
        );

        if ($path === false) {
            throw new RuntimeException('Gagal menyimpan foto profil.');
        }

        // Pastikan file berhasil ditulis
        $fullPath = $disk->path($path);
        if ($fullPath && file_exists($fullPath)) {
            @chmod($fullPath, 0644);
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
