<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\Event;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    public function index(): Response
    {
        $events = Event::query()
            ->with(['leader', 'room', 'category'])
            ->orderBy('start_time')
            ->get();

        return Inertia::render('superadmin/calendar', [
            'events' => EventResource::list($events),
        ]);
    }
}
