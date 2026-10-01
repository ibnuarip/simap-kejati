<?php

namespace Database\Factories;

use App\Models\AgendaReminderLog;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AgendaReminderLog>
 */
class AgendaReminderLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'agenda_id' => Event::factory(),
            'user_id' => User::factory(),
            'remind_at' => now(config('app.timezone')),
            'sent_at' => null,
        ];
    }
}
