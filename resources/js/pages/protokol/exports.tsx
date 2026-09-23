import { Head } from '@inertiajs/react';
import { toast } from 'sonner';
import { CalendarMinus, FileDown, Printer } from 'lucide-react';
import { AgendaItemRow } from '@/components/agenda-item-row';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard as protokolDashboard } from '@/routes/protokol';
import type { AgendaItem } from '@/types';

type Props = {
    reportDate: string;
    month: string;
    todayEvents: AgendaItem[];
};

export default function ProtokolExports({
    reportDate,
    month,
    todayEvents,
}: Props) {
    return (
        <>
            <Head title="Cetak & Ekspor" />

            <div className="flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Cetak & Ekspor
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Cetak agenda harian dan unduh rekap bulanan format PDF.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Printer className="size-4" />
                                Cetak Agenda Harian
                            </CardTitle>
                            <CardDescription>
                                Dokumen {reportDate} siap cetak/simpan untuk
                                arsip dan tanda tangan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {todayEvents.length === 0 ? (
                                <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-center text-sm">
                                    Tidak ada agenda untuk dicetak hari ini.
                                </p>
                            ) : (
                                <div className="divide-border flex flex-col divide-y">
                                    {todayEvents.map((event) => (
                                        <AgendaItemRow
                                            key={event.id}
                                            event={event}
                                        />
                                    ))}
                                </div>
                            )}
                            <Button
                                className="w-full sm:w-auto"
                                onClick={() =>
                                    toast.info(
                                        'Fitur cetak agenda harian akan segera hadir.',
                                    )
                                }
                            >
                                <Printer />
                                Cetak Agenda Harian
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileDown className="size-4" />
                                Rekap Bulanan PDF
                            </CardTitle>
                            <CardDescription>
                                Unduh rekap seluruh agenda {month} dalam format
                                PDF siap tanda tangan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <CalendarMinus className="text-muted-foreground size-10" />
                            <p className="text-muted-foreground text-sm">
                                Rekap bulanan mencakup ringkasan kegiatan
                                beserta pimpinan, ruangan, dan kategori setiap
                                agenda pada bulan berjalan.
                            </p>
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto"
                                onClick={() =>
                                    toast.info(
                                        'Fitur unduh rekap bulanan PDF akan segera hadir.',
                                    )
                                }
                            >
                                <FileDown />
                                Unduh Rekap Bulanan
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

ProtokolExports.layout = {
    breadcrumbs: [
        { title: 'Beranda', href: protokolDashboard().url },
        { title: 'Cetak & Ekspor', href: '/protokol/exports' },
    ],
};
