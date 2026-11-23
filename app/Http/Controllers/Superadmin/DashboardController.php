<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Event;
use App\Models\Leader;
use App\Models\Room;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    public function index(): Response
    {
        $now = now()->setTimezone(config('app.timezone'));
        $nowString = $now->toDateTimeString();

        /** @var object{total: int|string|null, cancelled: int|string|null, completed: int|string|null, ongoing: int|string|null, scheduled: int|string|null}|null $eventSummary */
        $eventSummary = Event::query()
            ->selectRaw(
                "COUNT(*) as total,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
                SUM(CASE WHEN status != 'cancelled' AND end_time < ? THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status != 'cancelled' AND end_time >= ? AND start_time <= ? THEN 1 ELSE 0 END) as ongoing,
                SUM(CASE WHEN status != 'cancelled' AND start_time > ? THEN 1 ELSE 0 END) as scheduled",
                [$nowString, $nowString, $nowString, $nowString]
            )
            ->toBase()
            ->first();

        $year = $now->format('Y');

        $agendaCountsByMonth = Event::query()
            ->whereNotNull('created_at')
            ->where('created_at', '>=', $now->startOfYear()->toDateTimeString())
            ->selectRaw('SUBSTR(created_at, 1, 7) as month_key, COUNT(*) as total')
            ->groupByRaw('SUBSTR(created_at, 1, 7)')
            ->pluck('total', 'month_key')
            ->map(fn (mixed $total): int => (int) $total);

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

        /** @var Collection<int, Category> $categories */
        $categories = Category::query()->get(['id', 'name', 'color']);

        $categoryDistribution = $categories
            ->map(fn (Category $category): array => [
                'name' => $category->name,
                'color' => $category->color ?? '#94A3B8',
                'total' => $agendaCountsByCategory[$category->id] ?? 0,
            ])
            ->filter(fn (array $row): bool => $row['total'] > 0)
            ->values()
            ->sortByDesc(fn (array $row): int => $row['total'])
            ->values();

        return Inertia::render('dashboard', [
            'stats' => [
                'users' => User::count(),
                'leaders' => Leader::count(),
                'rooms' => Room::count(),
                'categories' => $categories->count(),
                'events' => (int) ($eventSummary->total ?? 0),
                'eventsByStatus' => [
                    'scheduled' => (int) ($eventSummary->scheduled ?? 0),
                    'ongoing' => (int) ($eventSummary->ongoing ?? 0),
                    'completed' => (int) ($eventSummary->completed ?? 0),
                    'cancelled' => (int) ($eventSummary->cancelled ?? 0),
                ],
            ],
            'upcomingEvents' => $this->upcomingEvents($now),
            'recentEvents' => $this->recentEvents(),
            'eventsTrend' => $eventsTrend,
            'categoryDistribution' => $categoryDistribution,
        ]);
    }

    /**
     * @return \Illuminate\Support\Collection<int, array<string, mixed>>
     */
    private function upcomingEvents(CarbonInterface $now): \Illuminate\Support\Collection
    {
        /** @var Collection<int, Event> $upcomingEventModels */
        $upcomingEventModels = Event::query()
            ->with(['leader:id,name,position', 'room:id,name', 'category:id,name'])
            ->where('start_time', '>=', $now)
            ->where('status', '!=', 'completed')
            ->where('status', '!=', 'cancelled')
            ->orderBy('start_time')
            ->limit(5)
            ->get();

        return $upcomingEventModels
            ->map(fn (Event $event): array => [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'start_time' => $event->start_time->toDateTimeString(),
                'end_time' => $event->end_time->toDateTimeString(),
                'dress_code' => $event->dress_code,
                'participants' => $event->participants,
                'custom_location' => $event->custom_location,
                'attachment_name' => $event->attachment_name,
                'attachment_url' => $event->attachment_path ? route('events.attachment', $event) : null,
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
            ])
            ->values();
    }

    /**
     * @return \Illuminate\Support\Collection<int, array<string, mixed>>
     */
    private function recentEvents(): \Illuminate\Support\Collection
    {
        /** @var Collection<int, Event> $recentEventModels */
        $recentEventModels = Event::query()
            ->with('creator:id,name')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        return $recentEventModels
            ->map(fn (Event $event): array => [
                'id' => $event->id,
                'title' => $event->title,
                'status' => $event->currentStatus(),
                'created_at' => $event->created_at?->toDateTimeString(),
                'creator' => $event->creator ? ['id' => $event->creator->id, 'name' => $event->creator->name] : null,
            ])
            ->values();
    }
}
