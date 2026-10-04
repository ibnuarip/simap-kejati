<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Event;
use App\Models\Leader;
use App\Models\Room;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    public function index(): Response
    {
        $allEvents = Event::query()->get(['id', 'status', 'start_time', 'end_time']);

        $eventsByStatus = $allEvents
            ->countBy(fn (Event $event): string => $event->currentStatus())
            ->map(fn (int $total): int => $total);

        $year = now()->format('Y');

        $agendaCountsByMonth = Event::query()
            ->whereNotNull('created_at')
            ->where('created_at', '>=', now()->startOfYear())
            ->pluck('created_at')
            ->countBy(fn ($createdAt): string => $createdAt->format('Y-m'));

        $eventsTrend = collect(range(1, 12))->map(function (int $monthNumber) use ($agendaCountsByMonth, $year): array {
            $key = sprintf('%s-%02d', $year, $monthNumber);

            return [
                'month' => $key,
                'label' => self::MONTH_LABELS[$monthNumber - 1],
                'total' => $agendaCountsByMonth[$key] ?? 0,
            ];
        })->values();

        $agendaCountsByCategory = Event::query()
            ->whereNotNull('category_id')
            ->selectRaw('category_id, COUNT(*) as total')
            ->groupBy('category_id')
            ->pluck('total', 'category_id')
            ->map(fn (mixed $total): int => (int) $total);

        $categoryDistribution = Category::query()
            ->get()
            ->map(fn (Category $category): array => [
                'name' => $category->name,
                'color' => $category->color ?? '#94A3B8',
                'total' => $agendaCountsByCategory[$category->id] ?? 0,
            ])
            ->filter(fn (array $row): bool => $row['total'] > 0)
            ->values()
            ->sortByDesc(fn (array $row): int => $row['total'])
            ->values();

        $upcomingEvents = Event::query()
            ->with(['leader', 'room', 'category'])
            ->where('start_time', '>=', now()->setTimezone(config('app.timezone')))
            ->where('status', '!=', 'completed')
            ->where('status', '!=', 'cancelled')
            ->orderBy('start_time')
            ->limit(5)
            ->get()
            ->map(fn (Event $event): array => [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'start_time' => $event->start_time->toDateTimeString(),
                'end_time' => $event->end_time->toDateTimeString(),
                'dress_code' => $event->dress_code,
                'participants' => $event->participants,
                'custom_location' => $event->custom_location,
                'status' => $event->currentStatus(),
                'leader' => $event->leader ? [
                    'id' => $event->leader->id,
                    'name' => $event->leader->name,
                    'position' => $event->leader->position,
                ] : null,
                'room' => $event->room ? [
                    'id' => $event->room->id,
                    'name' => $event->room->name,
                ] : null,
                'category' => $event->category ? [
                    'id' => $event->category->id,
                    'name' => $event->category->name,
                ] : null,
            ]);

        $recentEvents = Event::query()
            ->with('creator:id,name')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn (Event $event): array => [
                'id' => $event->id,
                'title' => $event->title,
                'status' => $event->currentStatus(),
                'created_at' => $event->created_at?->toDateTimeString(),
                'creator' => $event->creator ? ['id' => $event->creator->id, 'name' => $event->creator->name] : null,
            ]);

        return Inertia::render('dashboard', [
            'stats' => [
                'users' => User::count(),
                'leaders' => Leader::count(),
                'rooms' => Room::count(),
                'categories' => Category::count(),
                'events' => Event::count(),
                'eventsByStatus' => [
                    'scheduled' => $eventsByStatus->get('scheduled', 0),
                    'ongoing' => $eventsByStatus->get('ongoing', 0),
                    'completed' => $eventsByStatus->get('completed', 0),
                    'cancelled' => $eventsByStatus->get('cancelled', 0),
                ],
            ],
            'upcomingEvents' => $upcomingEvents->values(),
            'recentEvents' => $recentEvents->values(),
            'eventsTrend' => $eventsTrend,
            'categoryDistribution' => $categoryDistribution,
        ]);
    }
}
