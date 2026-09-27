<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Mail\Auth\AccountCredentialsMail;
use App\Mail\Auth\WelcomeMail;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class UserController extends Controller
{
    public function index(): Response
    {
        $users = User::query()
            ->orderBy('role')
            ->orderBy('name')
            ->get()
            ->map(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'email_verified_at' => $user->email_verified_at?->toDateTimeString(),
                'created_at' => $user->created_at?->toDateTimeString(),
            ]);

        return Inertia::render('operator/users', [
            'users' => $users,
        ]);
    }

    public function store(UserRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $user = User::create($validated);

        $this->notifyAccountCreated($user, $validated['password']);

        return back();
    }

    /**
     * Send the welcome and account credentials emails to a newly created user.
     */
    protected function notifyAccountCreated(User $user, string $password): void
    {
        try {
            Mail::to($user)->send(new WelcomeMail($user));
            Mail::to($user)->send(new AccountCredentialsMail($user, $password));
        } catch (Throwable $e) {
            Log::error('Gagal mengirim email kredensial akun baru.', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function update(UserRequest $request, User $user): RedirectResponse
    {
        $user->update(array_filter([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'role' => $request->validated('role'),
            'password' => $request->filled('password') ? $request->input('password') : null,
        ], fn (mixed $value): bool => $value !== null));

        return back();
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_if($request->user()?->getAuthIdentifier() === $user->id, 403, 'Akun yang sedang login tidak dapat dihapus.');

        $user->delete();

        return back();
    }
}
