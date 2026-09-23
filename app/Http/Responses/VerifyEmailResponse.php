<?php

namespace App\Http\Responses;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use Laravel\Fortify\Contracts\VerifyEmailResponse as VerifyEmailResponseContract;

class VerifyEmailResponse implements VerifyEmailResponseContract
{
    public function toResponse($request): JsonResponse|RedirectResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        return $user instanceof User
            ? Redirect::to(LoginResponse::homeForRole($user).'?verified=1')
            : Redirect::to(config('fortify.home', '/dashboard').'?verified=1');
    }
}
