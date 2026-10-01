<?php

namespace App\Models;

use Database\Factories\AgendaReminderLogFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgendaReminderLog extends Model
{
    /** @use HasFactory<AgendaReminderLogFactory> */
    use HasFactory;

    public $timestamps = false;

    protected $table = 'agenda_reminder_logs';

    protected $fillable = [
        'agenda_id',
        'user_id',
        'remind_at',
        'sent_at',
    ];

    protected $casts = [
        'remind_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<Event, $this>
     */
    public function agenda(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'agenda_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
