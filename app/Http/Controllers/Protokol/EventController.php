<?php

namespace App\Http\Controllers\Protokol;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(Request $request): Response
    {
        $events = Event::query()
            ->with(['leader', 'room', 'category'])
            ->orderBy('start_time')
            ->get();

        return Inertia::render('protokol/events', [
            'events' => EventResource::list($events),
            'statusCounts' => [
                'total' => $events->count(),
                'scheduled' => $events->where('status', 'scheduled')->count(),
                'completed' => $events->where('status', 'completed')->count(),
                'cancelled' => $events->where('status', 'cancelled')->count(),
            ],
        ]);
    }
}
