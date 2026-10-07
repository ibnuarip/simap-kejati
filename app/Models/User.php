<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $avatar
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password', 'role', 'avatar', 'reminder_hours', 'email_verified_at'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    public function isSuperadmin(): bool
    {
        return $this->role === 'superadmin';
    }

    public function isProtokol(): bool
    {
        return $this->role === 'protokol';
    }

    public function isKajati(): bool
    {
        return $this->role === 'kajati';
    }

    public function isWakajati(): bool
    {
        return $this->role === 'wakajati';
    }

    /**
     * Pimpinan yang ditugaskan ke akun protokol (pivot leader_user).
     *
     * @return BelongsToMany<Leader, $this>
     */
    public function leaders(): BelongsToMany
    {
        return $this->belongsToMany(Leader::class)->withTimestamps();
    }

    /**
     * ID pimpinan yang boleh diakses akun protokol ini.
     *
     * @return list<int>
     */
    public function assignedLeaderIds(): array
    {
        return $this->leaders()->pluck('leaders.id')->map(fn ($id): int => (int) $id)->all();
    }

    /**
     * @return HasMany<PushSubscription, $this>
     */
    public function pushSubscriptions(): HasMany
    {
        return $this->hasMany(PushSubscription::class);
    }

    /**
     * A leadership account is considered active unless a leader record with
     * a matching email exists and has been deactivated.
     */
    public function isLeaderActive(): bool
    {
        $leader = Leader::query()->where('email', $this->email)->first();

        return $leader ? (bool) $leader->is_active : true;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'reminder_hours' => 'array',
        ];
    }
}
