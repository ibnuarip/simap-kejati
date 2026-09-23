<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

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
        User::create([...$request->validated(), 'email_verified_at' => now()]);

        return back();
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
