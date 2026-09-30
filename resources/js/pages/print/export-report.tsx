import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { agendaStatusLabel, formatTime } from '@/lib/agenda';
import type { AgendaItem } from '@/types';

type Props = {
    type: 'daily' | 'monthly';
    subtitle: string;
    periodLabel: string;
    generatedAt: string;
    events: AgendaItem[];
};

function formatDate(dateTime: string | null): string {
    if (!dateTime) {
        return '—';
    }

    const date = new Date(dateTime.replace(' ', 'T'));

    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

export default function ExportReport({
    subtitle,
    periodLabel,
    generatedAt,
    events,
}: Props) {
    const { auth } = usePage().props;

    useEffect(() => {
        const timer = setTimeout(() => window.print(), 300);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <Head title={`Cetak ${subtitle}`} />

            <div className="fixed inset-x-0 top-0 z-50 flex flex-wrap items-center justify-between gap-2 border-b bg-white px-4 py-2.5 shadow-sm print:hidden">
                <p className="text-sm font-medium whitespace-nowrap">
                    Laporan {subtitle} — {periodLabel}
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => window.print()}
                        className="w-full sm:w-auto"
                    >
                        <Printer />
                        Cetak / Simpan PDF
                    </Button>
                </div>
            </div>

            <div className="mx-auto w-full max-w-[210mm] bg-white px-4 py-6 text-gray-900 sm:px-8 sm:py-10 print:max-w-none print:px-0 print:py-0">
                <div className="border-b-4 border-gray-800 pb-4">
                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <img
                            src="/images/logo-kejati.png"
                            alt="Logo Kejaksaan Tinggi"
                            className="h-12 w-auto shrink-0 sm:h-16"
                        />
                        <div className="flex-1 text-center">
                            <p className="text-[11px] font-semibold tracking-wide uppercase">
                                Kejaksaan Agung Republik Indonesia
                            </p>
                            <h1 className="mt-0.5 text-lg font-bold tracking-wide uppercase">
                                Kejaksaan Tinggi — SIMAP
                            </h1>
                            <p className="mt-0.5 text-xs">
                                Sistem Informasi Manajemen Agenda Pimpinan
                            </p>
                        </div>
                        <div
                            className="h-12 w-12 shrink-0 sm:h-16 sm:w-16"
                            aria-hidden="true"
                        />
                    </div>
                    <p className="mt-3 text-center text-sm font-semibold uppercase">
                        Laporan {subtitle}
                    </p>
                    <p className="text-muted-foreground mt-1 text-center text-sm">
                        {periodLabel}
                    </p>
                </div>

                <div className="mt-6 overflow-x-auto">
                    {events.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-4 py-8 text-center text-sm">
                            Tidak ada agenda pada periode ini.
                        </div>
                    ) : (
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="border-b-2 border-gray-800">
                                    <th className="py-2 pr-2 text-left font-semibold">
                                        No
                                    </th>
                                    <th className="py-2 pr-2 text-left font-semibold">
                                        Waktu
                                    </th>
                                    <th className="py-2 pr-2 text-left font-semibold">
                                        Kegiatan
                                    </th>
                                    <th className="hidden py-2 pr-2 text-left font-semibold sm:table-cell">
                                        Pimpinan
                                    </th>
                                    <th className="hidden py-2 pr-2 text-left font-semibold sm:table-cell">
                                        Tempat
                                    </th>
                                    <th className="hidden py-2 pr-2 text-left font-semibold md:table-cell">
                                        Kategori
                                    </th>
                                    <th className="py-2 text-left font-semibold">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event, index) => (
                                    <tr
                                        key={event.id}
                                        className="border-b border-gray-300 align-top"
                                    >
                                        <td className="py-2 pr-2 tabular-nums">
                                            {index + 1}
                                        </td>
                                        <td className="py-2 pr-2 whitespace-nowrap tabular-nums">
                                            <div>
                                                {formatTime(event.start_time)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {formatDate(event.start_time)}
                                            </div>
                                        </td>
                                        <td className="py-2 pr-2">
                                            <div className="font-medium">
                                                {event.title}
                                            </div>
                                            {event.description ? (
                                                <div className="mt-0.5 text-xs text-gray-600">
                                                    {event.description}
                                                </div>
                                            ) : null}
                                        </td>
                                        <td className="hidden py-2 pr-2 sm:table-cell">
                                            {event.leader?.name ?? '—'}
                                        </td>
                                        <td className="hidden py-2 pr-2 sm:table-cell">
                                            {event.room?.name ??
                                                event.custom_location ??
                                                '—'}
                                        </td>
                                        <td className="hidden py-2 pr-2 md:table-cell">
                                            {event.category?.name ?? '—'}
                                        </td>
                                        <td className="py-2">
                                            {agendaStatusLabel[event.status]}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="mt-8 flex items-end justify-between text-sm print:mt-10">
                    <p className="text-xs text-gray-500">
                        Dicetak melalui SIMAP oleh {auth.user?.name} ·{' '}
                        {generatedAt}
                    </p>
                </div>
            </div>

            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:visible {
                        visibility: visible;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
        </>
    );
}

ExportReport.layout = {
    breadcrumbs: [],
};
