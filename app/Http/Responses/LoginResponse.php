<?php

namespace App\Http\Responses;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    /**
     * Redirect the authenticated user to the home page matching their role.
     */
    public static function homeForRole(User $user): string
    {
        return match ($user->role) {
            'protokol' => '/protokol',
            'kajati', 'wakajati' => '/leadership',
            default => '/dashboard',
        };
    }

    public function toResponse($request): JsonResponse|RedirectResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        if (! $user) {
            return Redirect::to('/');
        }

        return Redirect::to(self::homeForRole($user));
    }
}
