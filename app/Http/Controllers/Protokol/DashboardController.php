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
            ->whereAssignedTo($request->user())
            ->with(['leader', 'room', 'category'])
            ->orderBy('start_time')
            ->get();

        $today = CarbonImmutable::today(config('app.timezone'));
        $tomorrow = $today->addDay();

        $todayEvents = $events->filter(fn (Event $event) => $event->start_time->isSameDay($today))->values();

        // Agenda mendatang = tanggal MULAI hari setelah hari ini (bukan >=
        // hari ini 00:00, yang ikut mengambil agenda hari ini), belum selesai.
        $isUpcoming = fn (Event $event): bool => $event->start_time->greaterThanOrEqualTo($tomorrow)
            && $event->status !== 'completed'
            && $event->status !== 'cancelled';

        $upcomingEvents = $events->filter($isUpcoming)->take(3)->values();

        $upcomingCount = $events->filter($isUpcoming)->count();

        return Inertia::render('protokol/dashboard', [
            'stats' => [
                'today' => $todayEvents->count(),
                'upcoming' => $upcomingCount,
                'month' => $events->filter(fn (Event $event) => $event->start_time->isSameMonth($today))->count(),
                'cancelled' => $events->filter(fn (Event $event): bool => $event->currentStatus() === 'cancelled')->count(),
            ],
            'todayEvents' => EventResource::list($todayEvents),
            'upcomingEvents' => EventResource::list($upcomingEvents),
        ]);
    }
}
