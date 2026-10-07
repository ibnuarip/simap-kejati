<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\LeaderRequest;
use App\Models\Leader;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class LeaderController extends Controller
{
    public function index(): Response
    {
        $order = array_flip(Leader::POSITIONS);

        $leaders = Leader::query()
            ->withCount('events')
            ->orderBy('name')
            ->get()
            ->sortBy(fn (Leader $leader): array => [$order[$leader->position] ?? 999, $leader->name])
            ->values();

        return Inertia::render('superadmin/leaders', [
            'leaders' => $leaders->map(fn (Leader $leader): array => [
                'id' => $leader->id,
                'name' => $leader->name,
                'position' => $leader->position,
                'nip' => $leader->nip,
                'email' => $leader->email,
                'phone' => $leader->phone,
                'is_active' => $leader->is_active,
                'events_count' => (int) $leader->events_count,
            ]),
        ]);
    }

    public function store(LeaderRequest $request): RedirectResponse
    {
        Leader::create($request->validated());

        return back();
    }

    public function update(LeaderRequest $request, Leader $leader): RedirectResponse
    {
        $leader->update($request->validated());

        return back();
    }

    public function destroy(Leader $leader): RedirectResponse
    {
        if ($leader->events()->exists()) {
            return back()->withErrors([
                'leader' => 'Pimpinan masih memiliki agenda sehingga tidak dapat dihapus. Nonaktifkan pimpinan untuk tetap mempertahankan data agenda.',
            ]);
        }

        $leader->delete();

        return back();
    }
}
