import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { dashboard as protokolDashboard } from '@/routes/protokol';
import {
    index as exportsIndex,
    print as exportsPrint,
} from '@/routes/protokol/exports';
import type { AgendaItem } from '@/types';

type Props = {
    date: string;
    month: string;
    dateLabel: string;
    monthLabel: string;
    todayEvents: AgendaItem[];
};

export default function ProtokolExports({
    date,
    month,
    dateLabel,
    monthLabel,
    todayEvents,
}: Props) {
    const [dailyDate, setDailyDate] = useState(date);
    const [monthlyMonth, setMonthlyMonth] = useState(month);

    const printDaily = () => {
        router.get(exportsPrint().url, {
            type: 'daily',
            date: dailyDate,
        });
    };

    const printMonthly = () => {
        router.get(exportsPrint().url, {
            type: 'monthly',
            month: monthlyMonth,
        });
    };

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
                                Pilih tanggal lalu cetak dokumen siap arsip dan
                                tanda tangan, atau simpan sebagai PDF.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="grid gap-2">
                                <label className="text-muted-foreground text-xs font-medium">
                                    Tanggal
                                </label>
                                <Input
                                    type="date"
                                    value={dailyDate}
                                    onChange={(event) =>
                                        setDailyDate(event.target.value)
                                    }
                                />
                            </div>

                            {todayEvents.length === 0 ? (
                                <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-center text-sm">
                                    Tidak ada agenda untuk dicetak hari ini (
                                    {dateLabel}).
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
                                disabled={!dailyDate}
                                onClick={printDaily}
                            >
                                <Printer />
                                Cetak / Simpan PDF
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
                                Pilih bulan untuk mengunduh rekap seluruh agenda
                                dalam format PDF siap tanda tangan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="grid gap-2">
                                <label className="text-muted-foreground text-xs font-medium">
                                    Bulan
                                </label>
                                <Input
                                    type="month"
                                    value={monthlyMonth}
                                    onChange={(event) =>
                                        setMonthlyMonth(event.target.value)
                                    }
                                />
                            </div>

                            <div className="flex items-center gap-3 rounded-lg border p-4">
                                <CalendarMinus className="text-primary size-10 shrink-0" />
                                <p className="text-muted-foreground text-sm">
                                    Rekap bulanan {monthLabel} mencakup
                                    ringkasan kegiatan beserta pimpinan,
                                    ruangan, dan kategori setiap agenda pada
                                    bulan berjalan.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto"
                                disabled={!monthlyMonth}
                                onClick={printMonthly}
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
        { title: 'Cetak & Ekspor', href: exportsIndex().url },
    ],
};
