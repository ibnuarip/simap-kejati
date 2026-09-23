<?php

namespace App\Http\Controllers\Operator;

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
        $leaders = Leader::query()
            ->withCount('events')
            ->orderByRaw("CASE position WHEN 'Kajati' THEN 0 WHEN 'Wakajati' THEN 1 ELSE 2 END")
            ->orderBy('name')
            ->get();

        return Inertia::render('operator/leaders', [
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
        $leader->delete();

        return back();
    }
}
