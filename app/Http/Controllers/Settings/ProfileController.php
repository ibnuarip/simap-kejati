<?php

namespace App\Http\Controllers\Settings;

use App\Events\AccountDeleted;
use App\Events\EmailChanged;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Services\AvatarService;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request, AvatarService $avatars): RedirectResponse
    {
        $user = $request->user();
        $user->fill($request->safe()->except(['avatar']));

        $oldEmail = (string) $user->getOriginal('email');
        $emailChanged = $user->isDirty('email');

        if ($emailChanged) {
            $user->email_verified_at = null;
        }

        $user->save();

        if ($emailChanged) {
            EmailChanged::dispatch($user, $oldEmail, $user->email);
        }

        $avatars->syncFromRequest($user, $request);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $emailChanged ? 'Email berhasil diperbarui.' : 'Profil berhasil diperbarui.',
        ]);

        return to_route('profile.edit');
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request, AvatarService $avatars): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $avatars->delete($user);
        $user->delete();

        AccountDeleted::dispatch($user, AccountDeleted::DELETED_BY_SELF);

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
