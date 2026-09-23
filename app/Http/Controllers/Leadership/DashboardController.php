<?php

namespace App\Http\Controllers\Leadership;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\Event;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $position = $this->positionForRole($request->user()->role);

        $events = Event::query()
            ->with(['leader', 'room', 'category'])
            ->whereHas('leader', fn ($query) => $query->where('position', $position))
            ->orderBy('start_time')
            ->get();

        $today = CarbonImmutable::today();

        $todayEvents = $events->filter(fn (Event $event) => $event->start_time->isSameDay($today))->values();

        $upcomingEvents = $events
            ->filter(fn (Event $event) => $event->start_time->greaterThan($today))
            ->take(5)
            ->values();

        return Inertia::render('leadership/dashboard', [
            'stats' => [
                'today' => $todayEvents->count(),
                'upcoming' => $events->filter(fn (Event $event) => $event->start_time->greaterThan($today))->count(),
                'month' => $events->filter(fn (Event $event) => $event->start_time->isSameMonth($today))->count(),
            ],
            'todayEvents' => EventResource::list($todayEvents),
            'upcomingEvents' => EventResource::list($upcomingEvents),
        ]);
    }

    private function positionForRole(string $role): string
    {
        return $role === 'kajati' ? 'Kajati' : 'Wakajati';
    }
}
