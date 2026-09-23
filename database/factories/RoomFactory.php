<?php

namespace Database\Factories;

use App\Models\Room;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Room>
 */
class RoomFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'location' => fake()->address(),
            'capacity' => fake()->numberBetween(10, 500),
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
