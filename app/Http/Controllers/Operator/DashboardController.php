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
        $eventsByStatus = Event::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->map(fn (mixed $total): int => (int) $total);

        $agendaCountsByMonth = Event::query()
            ->whereNotNull('created_at')
            ->where('created_at', '>=', now()->subMonths(5)->startOfMonth())
            ->pluck('created_at')
            ->countBy(fn ($createdAt): string => $createdAt->format('Y-m'));

        $eventsTrend = collect(range(0, 5))->reverse()->map(function (int $offset) use ($agendaCountsByMonth): array {
            $month = now()->subMonths($offset);

            return [
                'month' => $month->format('Y-m'),
                'label' => self::MONTH_LABELS[$month->format('n') - 1],
                'total' => $agendaCountsByMonth[$month->format('Y-m')] ?? 0,
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
            ->where('start_time', '>=', now())
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
                'status' => $event->status,
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
            ->limit(8)
            ->get()
            ->map(fn (Event $event): array => [
                'id' => $event->id,
                'title' => $event->title,
                'status' => $event->status,
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
