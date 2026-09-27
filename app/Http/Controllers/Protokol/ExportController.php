<?php

namespace App\Http\Controllers\Protokol;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\Event;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Csv;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

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
        $report = $this->report($request);

        return Inertia::render('print/export-report', [
            'type' => $report['type'],
            'subtitle' => $report['subtitle'],
            'periodLabel' => $report['periodLabel'],
            'generatedAt' => now()->translatedFormat('d F Y · H:i'),
            'events' => EventResource::list($report['events']),
        ]);
    }

    public function download(Request $request): StreamedResponse
    {
        $format = $request->query('format', 'xlsx');

        abort_if(! in_array($format, ['xlsx', 'csv'], true), 422, 'Format ekspor tidak didukung.');

        $report = $this->report($request);

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        $sheet->setCellValue('A1', 'KEJAKSAAN TINGGI');
        $sheet->setCellValue('A2', "Laporan {$report['subtitle']}");
        $sheet->setCellValue('A3', $report['periodLabel']);
        $sheet->setCellValue('A4', 'Dicetak melalui SIMAP');

        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A2')->getFont()->setBold(true);
        $sheet->getStyle('A4')->getFont()->setItalic(true);

        $headerRow = 6;
        $headers = ['No', 'Waktu', 'Kegiatan', 'Pimpinan', 'Tempat', 'Kategori', 'Status'];

        foreach ($headers as $index => $header) {
            $column = chr(65 + $index);

            $sheet->setCellValue("{$column}{$headerRow}", $header);
        }

        $sheet->getStyle("A{$headerRow}:G{$headerRow}")->getFont()->setBold(true);

        $row = $headerRow + 1;

        foreach ($report['events'] as $event) {
            $sheet->setCellValue("A{$row}", $row - $headerRow);
            $sheet->setCellValue("B{$row}", $event->start_time->format('d/m/Y H:i'));
            $sheet->setCellValue("C{$row}", $event->title);
            $sheet->setCellValue("D{$row}", $event->leader->name ?? '');
            $sheet->setCellValue("E{$row}", $event->room->name ?? $event->custom_location ?? '');
            $sheet->setCellValue("F{$row}", $event->category->name ?? '');
            $sheet->setCellValue("G{$row}", $this->statusLabel($event->currentStatus()));
            $row++;
        }

        foreach (range('A', 'G') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        $slug = $report['type'] === 'monthly' ? 'rekap-bulanan' : 'agenda-harian';
        $filename = "{$slug}-{$report['periodKey']}.{$format}";

        $writer = $format === 'csv' ? new Csv($spreadsheet) : new Xlsx($spreadsheet);

        return response()->streamDownload(
            fn () => $writer->save('php://output'),
            $filename,
            [
                'Content-Type' => $format === 'csv'
                    ? 'text/csv; charset=UTF-8'
                    : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ],
        );
    }

    /**
     * Bangun data laporan (filter umum) untuk cetak ataupun unduh.
     *
     * @return array{type: 'daily'|'monthly', subtitle: string, periodLabel: string, periodKey: string, events: Collection<int, Event>}
     */
    private function report(Request $request): array
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

            return [
                'type' => 'monthly',
                'subtitle' => 'Rekap Bulanan',
                'periodLabel' => CarbonImmutable::createFromFormat('Y-m', $validated['month'])->translatedFormat('F Y'),
                'periodKey' => $validated['month'],
                'events' => $events,
            ];
        }

        $validated = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
        ]);

        $day = CarbonImmutable::createFromFormat('Y-m-d', $validated['date']);

        $events = Event::query()
            ->with(['leader', 'room', 'category'])
            ->whereBetween('start_time', [$day->startOfDay(), $day->endOfDay()])
            ->orderBy('start_time')
            ->get();

        return [
            'type' => 'daily',
            'subtitle' => 'Agenda Harian',
            'periodLabel' => $day->translatedFormat('d F Y'),
            'periodKey' => $validated['date'],
            'events' => $events,
        ];
    }

    private function statusLabel(string $status): string
    {
        return match ($status) {
            'scheduled' => 'Dijadwalkan',
            'ongoing' => 'Berlangsung',
            'completed' => 'Selesai',
            'cancelled' => 'Dibatalkan',
            default => $status,
        };
    }
}
