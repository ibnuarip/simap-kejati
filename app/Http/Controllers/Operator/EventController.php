<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Http\Requests\EventRequest;
use App\Http\Resources\EventResource;
use App\Models\Category;
use App\Models\Event;
use App\Models\Leader;
use App\Models\Room;
use Illuminate\Http\RedirectResponse;
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

        return Inertia::render('operator/events', [
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
                'scheduled' => $events->where('status', 'scheduled')->count(),
                'ongoing' => $events->where('status', 'ongoing')->count(),
                'completed' => $events->where('status', 'completed')->count(),
                'cancelled' => $events->where('status', 'cancelled')->count(),
            ],
        ]);
    }

    public function store(EventRequest $request): RedirectResponse
    {
        Event::create([
            ...$request->validated(),
            'created_by' => $request->user()?->getAuthIdentifier(),
        ]);

        return back();
    }

    public function update(EventRequest $request, Event $event): RedirectResponse
    {
        $event->update($request->validated());

        return back();
    }

    public function destroy(Event $event): RedirectResponse
    {
        $event->delete();

        return back();
    }
}
