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
            'reportDate' => $today->translatedFormat('d F Y'),
            'month' => $today->translatedFormat('F Y'),
            'todayEvents' => EventResource::list($todayEvents),
        ]);
    }
}
