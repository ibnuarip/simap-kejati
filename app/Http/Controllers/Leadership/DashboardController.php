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

        $leaderId = $leader->getKey();
        $nowString = now()->setTimezone(config('app.timezone'))->toDateTimeString();
        $today = CarbonImmutable::today(config('app.timezone'));
        $tomorrow = $today->addDay();
        $todayStart = $today->startOfDay()->toDateTimeString();
        $tomorrowStart = $tomorrow->startOfDay()->toDateTimeString();
        $monthStart = $today->startOfMonth()->toDateTimeString();
        $nextMonthStart = $today->startOfMonth()->addMonth()->toDateTimeString();

        /** @var object{today: int|string|null, ongoing: int|string|null, upcoming: int|string|null, month: int|string|null}|null $summary */
        $summary = Event::query()
            ->where('leader_id', $leaderId)
            ->selectRaw(
                "SUM(CASE WHEN start_time >= ? AND start_time < ? THEN 1 ELSE 0 END) as today,
                SUM(CASE WHEN status != 'cancelled' AND end_time >= ? AND start_time <= ? THEN 1 ELSE 0 END) as ongoing,
                SUM(CASE WHEN start_time >= ? AND status NOT IN ('completed', 'cancelled') THEN 1 ELSE 0 END) as upcoming,
                SUM(CASE WHEN start_time >= ? AND start_time < ? THEN 1 ELSE 0 END) as month",
                [$todayStart, $tomorrowStart, $nowString, $nowString, $tomorrowStart, $monthStart, $nextMonthStart]
            )
            ->toBase()
            ->first();

        $relations = ['leader:id,name,position', 'room:id,name', 'category:id,name'];

        $todayEvents = Event::query()
            ->where('leader_id', $leaderId)
            ->with($relations)
            ->where('start_time', '>=', $todayStart)
            ->where('start_time', '<', $tomorrowStart)
            ->orderBy('start_time')
            ->get();

        // Agenda mendatang = tanggal MULAI hari setelah hari ini (bukan >=
        // hari ini 00:00, yang ikut mengambil agenda hari ini), belum selesai.
        $upcomingEvents = Event::query()
            ->where('leader_id', $leaderId)
            ->with($relations)
            ->where('start_time', '>=', $tomorrowStart)
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->orderBy('start_time')
            ->limit(3)
            ->get();

        return Inertia::render('leadership/dashboard', [
            'leader' => [
                'name' => $leader->name,
                'position' => $leader->position,
            ],
            'stats' => [
                'today' => (int) ($summary->today ?? 0),
                'ongoing' => (int) ($summary->ongoing ?? 0),
                'upcoming' => (int) ($summary->upcoming ?? 0),
                'month' => (int) ($summary->month ?? 0),
            ],
            'todayEvents' => EventResource::list($todayEvents),
            'upcomingEvents' => EventResource::list($upcomingEvents),
        ]);
    }
}
