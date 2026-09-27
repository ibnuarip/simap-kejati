<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\DisableTwoFactorRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Actions\DisableTwoFactorAuthentication;
use Laravel\Fortify\TwoFactorAuthenticationProvider;

class TwoFactorController extends Controller
{
    /**
     * Disable two factor authentication after verifying a valid TOTP code.
     */
    public function disable(DisableTwoFactorRequest $request, TwoFactorAuthenticationProvider $provider): RedirectResponse
    {
        $user = $request->user();

        abort_unless((bool) $user->two_factor_secret, 404);

        if (! $provider->verify(decrypt($user->two_factor_secret), $request->validated('code'))) {
            throw ValidationException::withMessages([
                'code' => __('Kode verifikasi tidak valid.'),
            ]);
        }

        app(DisableTwoFactorAuthentication::class)($user);

        return back();
    }
}
