<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AccountDeleted
{
    use Dispatchable, SerializesModels;

    public const DELETED_BY_SELF = 'self';

    public const DELETED_BY_ADMIN = 'admin';

    /**
     * Create a new event instance.
     *
     * @param  'self'|'admin'  $deletedBy
     */
    public function __construct(
        public User $user,
        public string $deletedBy,
    ) {}
}
