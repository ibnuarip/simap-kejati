<?php

namespace App\Models;

use Database\Factories\LeaderFactory;
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
        'Kajati',
        'Wakajati',
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
