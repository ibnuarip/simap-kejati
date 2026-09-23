<?php

namespace App\Http\Controllers\Leadership;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    public function index(Request $request): Response
    {
        $position = $request->user()->role === 'kajati' ? 'Kajati' : 'Wakajati';

        $events = Event::query()
            ->with(['leader', 'room', 'category'])
            ->whereHas('leader', fn ($query) => $query->where('position', $position))
            ->orderBy('start_time')
            ->get();

        return Inertia::render('leadership/calendar', [
            'events' => EventResource::list($events),
        ]);
    }
}
