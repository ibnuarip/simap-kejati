<?php

namespace App\Http\Controllers;

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
        $timezone = (string) config('app.timezone');
        $today = CarbonImmutable::today($timezone);

        // Dipakai dua grup route (superadmin & protokol): breadcrumb dan
        // endpoint mengikuti role user yang sedang login.
        $prefix = $request->user()?->role === 'superadmin' ? '' : 'protokol.';

        return Inertia::render('protokol/exports', [
            'defaults' => [
                'date' => $today->format('Y-m-d'),
                'week' => $today->format('o-\WW'),
                'month' => $today->format('Y-m'),
                'year' => $today->format('Y'),
            ],
            'homeUrl' => route($prefix.'dashboard'),
            'homeTitle' => $prefix === '' ? 'Dashboard' : 'Beranda',
            'printUrl' => route($prefix.'exports.print'),
            'downloadBaseUrl' => route($prefix.'exports.download'),
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

        $slug = match ($report['type']) {
            'weekly' => 'rekap-mingguan',
            'monthly' => 'rekap-bulanan',
            'yearly' => 'rekap-tahunan',
            'custom' => 'rekap-kustom',
            default => 'agenda-harian',
        };
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
     * @return array{type: string, subtitle: string, periodLabel: string, periodKey: string, events: Collection<int, Event>}
     */
    private function report(Request $request): array
    {
        $timezone = (string) config('app.timezone');

        $request->validate(
            ['type' => ['nullable', 'in:daily,weekly,monthly,yearly,custom']],
            $this->messages()
        );

        $type = $request->query('type', 'daily');

        $validated = $request->validate($this->rules($type), $this->messages());

        $range = $this->resolveRange($type, $validated, $timezone);

        $events = Event::query()
            ->with(['leader', 'room', 'category'])
            ->when(
                $request->user()?->isProtokol(),
                fn ($query) => $query->whereAssignedTo($request->user())
            )
            ->whereBetween('start_time', [$range['start'], $range['end']])
            ->orderBy('start_time')
            ->get();

        return [
            'type' => $range['type'],
            'subtitle' => $range['subtitle'],
            'periodLabel' => $range['periodLabel'],
            'periodKey' => $range['periodKey'],
            'events' => $events,
        ];
    }

    /**
     * @return array<string, array<int, string>>
     */
    private function rules(?string $type): array
    {
        return match ($type) {
            'weekly' => ['week' => ['required', 'regex:/^\d{4}-W\d{2}$/']],
            'monthly' => ['month' => ['required', 'date_format:Y-m']],
            'yearly' => ['year' => ['required', 'digits:4', 'integer', 'min:2000', 'max:2100']],
            'custom' => [
                'start' => ['required', 'date_format:Y-m-d'],
                'end' => ['required', 'date_format:Y-m-d', 'after_or_equal:start'],
            ],
            default => [
                'date' => ['required', 'date_format:Y-m-d'],
            ],
        };
    }

    /**
     * @return array<string, string>
     */
    private function messages(): array
    {
        return [
            'type.in' => 'Jenis periode tidak valid.',
            'date.required' => 'Tanggal wajib diisi.',
            'date.date_format' => 'Format tanggal tidak valid (YYYY-MM-DD).',
            'week.required' => 'Minggu wajib dipilih.',
            'week.regex' => 'Format minggu tidak valid.',
            'month.required' => 'Bulan wajib dipilih.',
            'month.date_format' => 'Format bulan tidak valid (YYYY-MM).',
            'year.required' => 'Tahun wajib diisi.',
            'year.digits' => 'Tahun harus terdiri dari 4 digit.',
            'year.integer' => 'Tahun harus berupa angka.',
            'year.min' => 'Tahun minimal 2000.',
            'year.max' => 'Tahun maksimal 2100.',
            'start.required' => 'Tanggal mulai wajib diisi.',
            'start.date_format' => 'Format tanggal mulai tidak valid (YYYY-MM-DD).',
            'end.required' => 'Tanggal selesai wajib diisi.',
            'end.date_format' => 'Format tanggal selesai tidak valid (YYYY-MM-DD).',
            'end.after_or_equal' => 'Tanggal selesai tidak boleh sebelum tanggal mulai.',
        ];
    }

    /**
     * Ubah parameter periode menjadi rentang tanggal Asia/Jakarta.
     *
     * @param  array<string, string>  $validated
     * @return array{type: string, subtitle: string, periodLabel: string, periodKey: string, start: CarbonImmutable, end: CarbonImmutable}
     */
    private function resolveRange(string $type, array $validated, string $timezone): array
    {
        $dayLabel = fn (CarbonImmutable $date): string => $date->translatedFormat('j F Y');

        if ($type === 'weekly') {
            [$year, $week] = explode('-W', $validated['week']);

            // Senin pada minggu ISO tersebut (standar Indonesia).
            $monday = CarbonImmutable::create((int) $year, 1, 4, 0, 0, 0, $timezone)
                ->startOfWeek(CarbonImmutable::MONDAY)
                ->addWeeks((int) $week - 1);

            abort_if((int) $monday->format('W') !== (int) $week, 422, 'Minggu tidak valid untuk tahun tersebut.');

            $start = $monday->startOfDay();
            $end = $monday->addDays(6)->endOfDay();

            return [
                'type' => 'weekly',
                'subtitle' => 'Rekap Mingguan',
                'periodLabel' => $dayLabel($start).' - '.$dayLabel($end),
                'periodKey' => $validated['week'],
                'start' => $start,
                'end' => $end,
            ];
        }

        if ($type === 'monthly') {
            [$year, $month] = explode('-', $validated['month']);

            $start = CarbonImmutable::create((int) $year, (int) $month, 1, 0, 0, 0, $timezone)->startOfDay();
            $end = $start->endOfMonth()->endOfDay();

            return [
                'type' => 'monthly',
                'subtitle' => 'Rekap Bulanan',
                'periodLabel' => $start->translatedFormat('F Y'),
                'periodKey' => $validated['month'],
                'start' => $start,
                'end' => $end,
            ];
        }

        if ($type === 'yearly') {
            $start = CarbonImmutable::create((int) $validated['year'], 1, 1, 0, 0, 0, $timezone)->startOfDay();
            $end = CarbonImmutable::create((int) $validated['year'], 12, 31, 0, 0, 0, $timezone)->endOfDay();

            return [
                'type' => 'yearly',
                'subtitle' => 'Rekap Tahunan',
                'periodLabel' => 'Tahun '.$validated['year'],
                'periodKey' => $validated['year'],
                'start' => $start,
                'end' => $end,
            ];
        }

        if ($type === 'custom') {
            $start = CarbonImmutable::createFromFormat('Y-m-d', $validated['start'], $timezone)->startOfDay();
            $end = CarbonImmutable::createFromFormat('Y-m-d', $validated['end'], $timezone)->endOfDay();

            return [
                'type' => 'custom',
                'subtitle' => 'Rekap Agenda',
                'periodLabel' => $dayLabel($start).' - '.$dayLabel($end),
                'periodKey' => $validated['start'].'_sd_'.$validated['end'],
                'start' => $start,
                'end' => $end,
            ];
        }

        $day = CarbonImmutable::createFromFormat('Y-m-d', $validated['date'], $timezone);

        return [
            'type' => 'daily',
            'subtitle' => 'Agenda Harian',
            'periodLabel' => $dayLabel($day),
            'periodKey' => $validated['date'],
            'start' => $day->startOfDay(),
            'end' => $day->endOfDay(),
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
