<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Http\Requests\RoomRequest;
use App\Models\Room;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RoomController extends Controller
{
    public function index(): Response
    {
        $rooms = Room::query()
            ->withCount('events')
            ->orderBy('name')
            ->get();

        return Inertia::render('operator/rooms', [
            'rooms' => $rooms->map(fn (Room $room): array => [
                'id' => $room->id,
                'name' => $room->name,
                'location' => $room->location,
                'capacity' => $room->capacity,
                'description' => $room->description,
                'is_active' => $room->is_active,
                'events_count' => (int) $room->events_count,
            ]),
        ]);
    }

    public function store(RoomRequest $request): RedirectResponse
    {
        Room::create($request->validated());

        return back();
    }

    public function update(RoomRequest $request, Room $room): RedirectResponse
    {
        $room->update($request->validated());

        return back();
    }

    public function destroy(Room $room): RedirectResponse
    {
        $room->delete();

        return back();
    }
}
