<?php

namespace App\Http\Controllers\Protokol;

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
        $events = Event::query()
            ->with(['leader', 'room', 'category'])
            ->orderBy('start_time')
            ->get();

        $today = CarbonImmutable::today();

        $todayEvents = $events->filter(fn (Event $event) => $event->start_time->isSameDay($today))->values();

        $upcomingEvents = $events
            ->filter(fn (Event $event) => $event->start_time->greaterThanOrEqualTo($today))
            ->take(5)
            ->values();

        $upcomingCount = $events->filter(fn (Event $event) => $event->start_time->greaterThan($today))->count();
        $thisWeekReminders = $events
            ->filter(fn (Event $event) => $event->status === 'scheduled' && $event->start_time->between($today, $today->addDays(7)))
            ->count();

        return Inertia::render('protokol/dashboard', [
            'stats' => [
                'today' => $todayEvents->count(),
                'upcoming' => $upcomingCount,
                'month' => $events->filter(fn (Event $event) => $event->start_time->isSameMonth($today))->count(),
                'cancelled' => $events->where('status', 'cancelled')->count(),
                'reminders_active' => $thisWeekReminders,
            ],
            'todayEvents' => EventResource::list($todayEvents),
            'upcomingEvents' => EventResource::list($upcomingEvents),
        ]);
    }
}
