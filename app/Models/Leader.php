<?php

namespace App\Models;

use Database\Factories\LeaderFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $position
 * @property string $nip
 * @property string $email
 * @property string|null $phone
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Leader extends Model
{
    public const DEACTIVATED_MESSAGE = 'Akun Anda telah dinonaktifkan';

    /**
     * 12 jabatan struktural sesuai struktur organisasi Kejati.
     * Urutan array = urutan tampil di seluruh aplikasi.
     *
     * @var list<string>
     */
    public const POSITIONS = [
        'Kepala Kejaksaan Tinggi',
        'Wakil Kepala Kejaksaan Tinggi',
        'Asisten Bidang Pembinaan',
        'Asisten Bidang Intelijen',
        'Asisten Bidang Tindak Pidana Umum',
        'Asisten Bidang Tindak Pidana Khusus',
        'Asisten Bidang Perdata dan Tata Usaha Negara',
        'Asisten Bidang Pidana Militer',
        'Asisten Bidang Pemulihan Aset',
        'Asisten Bidang Pengawasan',
        'Bagian Tata Usaha',
        'Koordinator',
    ];

    /** @use HasFactory<LeaderFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'position',
        'nip',
        'email',
        'phone',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Samarkan NIP 18 digit menjadi 4 digit awal + 10 huruf 'x' + 4 digit akhir.
     */
    public static function maskNip(string $nip): string
    {
        if (! preg_match('/^\d{18}$/', $nip)) {
            return $nip;
        }

        return substr($nip, 0, 4).str_repeat('x', strlen($nip) - 8).substr($nip, -4);
    }

    /**
     * Samarkan nomor telepon 08xxxxxxxxxx menjadi +62xxxxxxx1234.
     */
    public static function maskPhone(string $phone): string
    {
        if (! preg_match('/^08\d{8,12}$/', $phone)) {
            return $phone;
        }

        $middleLength = strlen($phone) - 5;

        return '+62'.str_repeat('x', $middleLength).substr($phone, -4);
    }

    /**
     * @return Attribute<string|null, string|null>
     */
    protected function nip(): Attribute
    {
        return Attribute::make(
            set: fn (?string $value): ?string => $value !== null ? self::maskNip($value) : null,
        );
    }

    /**
     * @return Attribute<string|null, string|null>
     */
    protected function phone(): Attribute
    {
        return Attribute::make(
            set: fn (?string $value): ?string => $value !== null ? self::maskPhone($value) : null,
        );
    }

    /**
     * @return HasMany<Event, $this>
     */
    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    /**
     * Akun protokol yang ditugaskan ke pimpinan ini.
     *
     * @return BelongsToMany<User, $this>
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withTimestamps();
    }
}
