<?php

namespace App\Http\Controllers\Protokol;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\Event;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExportController extends Controller
{
    public function index(Request $request): Response
    {
        $today = CarbonImmutable::today();

        $todayEvents = Event::query()
            ->with(['leader', 'room', 'category'])
            ->whereBetween('start_time', [$today->startOfDay(), $today->endOfDay()])
            ->orderBy('start_time')
            ->get();

        return Inertia::render('protokol/exports', [
            'date' => $today->format('Y-m-d'),
            'month' => $today->format('Y-m'),
            'dateLabel' => $today->translatedFormat('d F Y'),
            'monthLabel' => $today->translatedFormat('F Y'),
            'todayEvents' => EventResource::list($todayEvents),
        ]);
    }

    public function print(Request $request): Response
    {
        $type = $request->query('type', 'daily');

        if ($type === 'monthly') {
            $validated = $request->validate([
                'month' => ['required', 'date_format:Y-m'],
            ]);

            [$year, $month] = explode('-', $validated['month']);

            $events = Event::query()
                ->with(['leader', 'room', 'category'])
                ->whereYear('start_time', (int) $year)
                ->whereMonth('start_time', (int) $month)
                ->orderBy('start_time')
                ->get();

            $subtitle = 'Rekap Bulanan';
            $periodLabel = CarbonImmutable::createFromFormat('Y-m', $validated['month'])->translatedFormat('F Y');
        } else {
            $validated = $request->validate([
                'date' => ['required', 'date_format:Y-m-d'],
            ]);

            $day = CarbonImmutable::createFromFormat('Y-m-d', $validated['date']);

            $events = Event::query()
                ->with(['leader', 'room', 'category'])
                ->whereBetween('start_time', [$day->startOfDay(), $day->endOfDay()])
                ->orderBy('start_time')
                ->get();

            $subtitle = 'Agenda Harian';
            $periodLabel = $day->translatedFormat('d F Y');
        }

        return Inertia::render('print/export-report', [
            'type' => $type,
            'subtitle' => $subtitle,
            'periodLabel' => $periodLabel,
            'generatedAt' => now()->translatedFormat('d F Y · H:i'),
            'events' => EventResource::list($events),
        ]);
    }
}
