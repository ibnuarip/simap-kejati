<?php

namespace Database\Factories;

use App\Models\PushSubscription;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PushSubscription>
 */
class PushSubscriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'endpoint' => 'https://push.example.com/sub/'.fake()->uuid(),
            'public_key' => fake()->lexify(str_repeat('?', 64)),
            'auth_secret' => fake()->lexify(str_repeat('?', 24)),
            'name' => fake()->randomElement(['Perangkat Desktop', 'Perangkat Mobile']),
            'user_agent' => fake()->userAgent(),
            'last_used_at' => null,
        ];
    }
}
