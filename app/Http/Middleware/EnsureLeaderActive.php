<?php

namespace App\Http\Middleware;

use App\Models\Leader;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureLeaderActive
{
    /**
     * Revoke the session of a pimpinan user whose linked leader has been
     * deactivated (or unlinked), and send them back to the login screen.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->isPimpinan() && ! $user->hasActiveLeader()) {
            Auth::logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'email' => Leader::DEACTIVATED_MESSAGE,
            ]);
        }

        return $next($request);
    }
}
