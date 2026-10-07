<?php

namespace App\Http\Controllers\Leadership;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Models\Leader;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    public function index(Request $request): Response
    {
        $leader = $request->user()->leader;

        abort_unless($leader instanceof Leader, 403, 'Akun Anda belum ditautkan ke data pimpinan.');

        $events = Event::query()
            ->with(['leader', 'room', 'category'])
            ->where('leader_id', $leader->getKey())
            ->orderBy('start_time')
            ->get();

        return Inertia::render('leadership/calendar', [
            'events' => EventResource::list($events),
        ]);
    }
}
