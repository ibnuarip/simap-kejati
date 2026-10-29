<?php

namespace App\Http\Responses;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Contracts\TwoFactorLoginResponse as TwoFactorLoginResponseContract;
use Laravel\Passkeys\Contracts\PasskeyLoginResponse as PasskeyLoginResponseContract;

class LoginResponse implements LoginResponseContract, PasskeyLoginResponseContract, TwoFactorLoginResponseContract
{
    /**
     * Redirect the authenticated user to the home page matching their role.
     */
    public static function homeForRole(User $user): string
    {
        return match ($user->role) {
            'protokol' => '/protokol',
            'pimpinan' => '/leadership',
            default => '/dashboard',
        };
    }

    public function toResponse($request): JsonResponse|RedirectResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        $target = $user ? self::homeForRole($user) : '/';

        if ($request->wantsJson()) {
            return new JsonResponse([
                'redirect' => url($target),
            ], 200);
        }

        return Redirect::to($target);
    }
}
