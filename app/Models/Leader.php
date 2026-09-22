<?php

namespace App\Models;

use Database\Factories\LeaderFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Leader extends Model
{
    /** @use HasFactory<LeaderFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'position',
        'nip',
        'email',
        'phone',
        'photo',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function events()
    {
        return $this->hasMany(Event::class);
    }
}
