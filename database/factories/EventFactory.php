<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Event;
use App\Models\Leader;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'leader_id' => Leader::factory(),
            'room_id' => Room::factory(),
            'category_id' => Category::factory(),
            'custom_location' => null,
            'start_time' => now()->addDay()->setTime(9, 0),
            'end_time' => now()->addDay()->setTime(11, 0),
            'dress_code' => 'PDH',
            'participants' => fake()->sentence(10),
            'status' => 'scheduled',
            'created_by' => User::factory(),
        ];
    }
}
