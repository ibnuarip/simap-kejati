<?php

namespace App\Http\Controllers\Protokol;

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
        $events = Event::query()
            ->with(['leader', 'room', 'category'])
            ->orderBy('start_time')
            ->get();

        return Inertia::render('protokol/calendar', [
            'events' => EventResource::list($events),
        ]);
    }
}
