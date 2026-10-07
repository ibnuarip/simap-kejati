<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\EventRequest;
use App\Http\Resources\EventResource;
use App\Models\Category;
use App\Models\Event;
use App\Models\Leader;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(): Response
    {
        $events = Event::query()
            ->with(['leader', 'room', 'category'])
            ->orderByDesc('start_time')
            ->get();

        $leaders = Leader::query()->where('is_active', true)->orderBy('name')->get();
        $rooms = Room::query()->where('is_active', true)->orderBy('name')->get();
        $categories = Category::query()->orderBy('name')->get();

        $statusCounts = $events->countBy(fn (Event $event): string => $event->currentStatus());

        return Inertia::render('superadmin/events', [
            'events' => EventResource::list($events),
            'leaders' => $leaders->map(fn (Leader $leader): array => [
                'id' => $leader->id,
                'name' => $leader->name,
            ]),
            'rooms' => $rooms->map(fn (Room $room): array => [
                'id' => $room->id,
                'name' => $room->name,
            ]),
            'categories' => $categories->map(fn (Category $category): array => [
                'id' => $category->id,
                'name' => $category->name,
            ]),
            'statusCounts' => [
                'total' => $events->count(),
                'scheduled' => $statusCounts['scheduled'] ?? 0,
                'ongoing' => $statusCounts['ongoing'] ?? 0,
                'completed' => $statusCounts['completed'] ?? 0,
                'cancelled' => $statusCounts['cancelled'] ?? 0,
            ],
        ]);
    }

    public function store(EventRequest $request): RedirectResponse
    {
        Event::create([
            ...$request->safe()->except('force_save'),
            'created_by' => $request->user()?->getAuthIdentifier(),
        ]);

        return back();
    }

    public function update(EventRequest $request, Event $event): RedirectResponse
    {
        $event->update($request->safe()->except('force_save'));

        return back();
    }

    /**
     * Daftar agenda yang bentrok dengan rentang waktu usulan.
     */
    public function conflicts(Request $request): JsonResponse
    {
        $validated = $request->validate(
            [
                'start' => ['required', 'date'],
                'end' => ['required', 'date', 'after:start'],
                'except_id' => ['nullable', 'integer', Rule::exists('events', 'id')],
            ],
            [
                'start.required' => 'Waktu mulai wajib diisi.',
                'start.date' => 'Format waktu mulai tidak valid.',
                'end.required' => 'Waktu selesai wajib diisi.',
                'end.date' => 'Format waktu selesai tidak valid.',
                'end.after' => 'Waktu selesai harus setelah waktu mulai.',
            ]
        );

        $timezone = (string) config('app.timezone');
        $start = Carbon::parse($validated['start'], $timezone);
        $end = Carbon::parse($validated['end'], $timezone);

        $conflicts = Event::query()
            ->with(['leader', 'room', 'category'])
            ->overlapping($start, $end, isset($validated['except_id']) ? (int) $validated['except_id'] : null)
            ->orderBy('start_time')
            ->limit(10)
            ->get();

        return response()->json([
            'count' => Event::overlapping($start, $end, isset($validated['except_id']) ? (int) $validated['except_id'] : null)->count(),
            'events' => EventResource::list($conflicts),
        ]);
    }

    public function destroy(Event $event): RedirectResponse
    {
        $event->delete();

        return back();
    }

    public function cancel(Event $event): RedirectResponse
    {
        if (! $event->canBeCancelled()) {
            return back()->withErrors([
                'event' => 'Agenda sudah berlangsung atau selesai dan tidak dapat dibatalkan.',
            ]);
        }

        $event->update(['status' => 'cancelled']);

        return back();
    }
}
