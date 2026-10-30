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
        $leaderIds = $request->user()->assignedLeaderIds();

        if ($leaderIds === []) {
            return Inertia::render('protokol/dashboard', [
                'stats' => [
                    'today' => 0,
                    'upcoming' => 0,
                    'month' => 0,
                    'cancelled' => 0,
                ],
                'todayEvents' => [],
                'upcomingEvents' => [],
            ]);
        }

        $today = CarbonImmutable::today(config('app.timezone'));
        $tomorrow = $today->addDay();
        $todayStart = $today->startOfDay()->toDateTimeString();
        $tomorrowStart = $tomorrow->startOfDay()->toDateTimeString();
        $monthStart = $today->startOfMonth()->toDateTimeString();
        $nextMonthStart = $today->startOfMonth()->addMonth()->toDateTimeString();

        /** @var object{today: int|string|null, upcoming: int|string|null, month: int|string|null, cancelled: int|string|null}|null $summary */
        $summary = Event::query()
            ->whereIn('leader_id', $leaderIds)
            ->selectRaw(
                "SUM(CASE WHEN start_time >= ? AND start_time < ? THEN 1 ELSE 0 END) as today,
                SUM(CASE WHEN start_time >= ? AND status NOT IN ('completed', 'cancelled') THEN 1 ELSE 0 END) as upcoming,
                SUM(CASE WHEN start_time >= ? AND start_time < ? THEN 1 ELSE 0 END) as month,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled",
                [$todayStart, $tomorrowStart, $tomorrowStart, $monthStart, $nextMonthStart]
            )
            ->toBase()
            ->first();

        $relations = ['leader:id,name,position', 'room:id,name', 'category:id,name'];

        $todayEvents = Event::query()
            ->whereIn('leader_id', $leaderIds)
            ->with($relations)
            ->where('start_time', '>=', $todayStart)
            ->where('start_time', '<', $tomorrowStart)
            ->orderBy('start_time')
            ->get();

        // Agenda mendatang = tanggal MULAI hari setelah hari ini (bukan >=
        // hari ini 00:00, yang ikut mengambil agenda hari ini), belum selesai.
        $upcomingEvents = Event::query()
            ->whereIn('leader_id', $leaderIds)
            ->with($relations)
            ->where('start_time', '>=', $tomorrowStart)
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->orderBy('start_time')
            ->limit(3)
            ->get();

        return Inertia::render('protokol/dashboard', [
            'stats' => [
                'today' => (int) ($summary->today ?? 0),
                'upcoming' => (int) ($summary->upcoming ?? 0),
                'month' => (int) ($summary->month ?? 0),
                'cancelled' => (int) ($summary->cancelled ?? 0),
            ],
            'todayEvents' => EventResource::list($todayEvents),
            'upcomingEvents' => EventResource::list($upcomingEvents),
        ]);
    }
}
