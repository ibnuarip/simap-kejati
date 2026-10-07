<?php

namespace App\Http\Controllers\Leadership;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Models\Leader;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $leader = $user->leader;

        abort_unless($leader instanceof Leader, 403, 'Akun Anda belum ditautkan ke data pimpinan.');

        $events = Event::query()
            ->with(['leader', 'room', 'category'])
            ->where('leader_id', $leader->getKey())
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

        return Inertia::render('leadership/dashboard', [
            'leader' => [
                'name' => $leader->name,
                'position' => $leader->position,
            ],
            'stats' => [
                'today' => $todayEvents->count(),
                'ongoing' => $events->filter(fn (Event $event) => $event->currentStatus() === 'ongoing')->count(),
                'upcoming' => $events->filter($isUpcoming)->count(),
                'month' => $events->filter(fn (Event $event) => $event->start_time->isSameMonth($today))->count(),
            ],
            'todayEvents' => EventResource::list($todayEvents),
            'upcomingEvents' => EventResource::list($upcomingEvents),
        ]);
    }
}
