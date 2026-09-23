<?php

namespace App\Models;

use Database\Factories\EventFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $title
 * @property string|null $description
 * @property int $leader_id
 * @property int $room_id
 * @property string|null $custom_location
 * @property int $category_id
 * @property Carbon $start_time
 * @property Carbon $end_time
 * @property string|null $dress_code
 * @property string|null $participants
 * @property string $status
 * @property int|null $created_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Leader|null $leader
 * @property-read Room|null $room
 * @property-read Category|null $category
 * @property-read User|null $creator
 */
class Event extends Model
{
    /** @use HasFactory<EventFactory> */
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'leader_id',
        'room_id',
        'custom_location',
        'category_id',
        'start_time',
        'end_time',
        'dress_code',
        'participants',
        'status',
        'created_by',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    /**
     * @return BelongsTo<Leader, $this>
     */
    public function leader(): BelongsTo
    {
        return $this->belongsTo(Leader::class);
    }

    /**
     * @return BelongsTo<Room, $this>
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
