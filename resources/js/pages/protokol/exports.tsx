import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    CalendarMinus,
    FileDown,
    FileSpreadsheet,
    FileText,
} from 'lucide-react';
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
    download as exportsDownload,
    index as exportsIndex,
    print as exportsPrint,
} from '@/routes/protokol/exports';

type Props = {
    month: string;
    monthLabel: string;
};

function formatMonthLabel(value: string, fallback: string): string {
    if (!value) {
        return fallback;
    }

    const date = new Date(`${value}-02T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return fallback;
    }

    return date.toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
    });
}

export default function ProtokolExports({ month, monthLabel }: Props) {
    const [monthlyMonth, setMonthlyMonth] = useState(month);

    const printMonthly = () => {
        router.get(exportsPrint().url, {
            type: 'monthly',
            month: monthlyMonth,
        });
    };

    const monthlyUrl = (format: 'xlsx' | 'csv') =>
        exportsDownload.url({
            query: { type: 'monthly', month: monthlyMonth, format },
        });

    return (
        <>
            <Head title="Cetak & Ekspor" />

            <div className="flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Cetak & Ekspor
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Cetak atau unduh rekap bulanan seluruh agenda dalam
                        format PDF, Excel, atau CSV.
                    </p>
                </div>

                <div className="grid gap-6 md:max-w-2xl">
                    <Card className="min-w-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileDown className="size-4 shrink-0" />
                                Rekap Bulanan
                            </CardTitle>
                            <CardDescription>
                                Pilih bulan untuk mencetak atau mengunduh rekap
                                seluruh agenda dalam format PDF, Excel, atau
                                CSV.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="grid gap-2">
                                <label
                                    htmlFor="rekap-bulan"
                                    className="text-muted-foreground text-xs font-medium"
                                >
                                    Bulan
                                </label>
                                <Input
                                    id="rekap-bulan"
                                    type="month"
                                    value={monthlyMonth}
                                    onChange={(event) =>
                                        setMonthlyMonth(event.target.value)
                                    }
                                />
                            </div>

                            <div className="flex items-center gap-3 rounded-lg border p-4">
                                <CalendarMinus className="text-primary size-10 shrink-0" />
                                <p className="text-muted-foreground min-w-0 text-sm">
                                    Rekap bulanan{' '}
                                    {formatMonthLabel(monthlyMonth, monthLabel)}{' '}
                                    mencakup ringkasan kegiatan beserta
                                    pimpinan, ruangan, dan kategori setiap
                                    agenda pada bulan tersebut.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Button
                                    variant="outline"
                                    className="w-full sm:w-auto"
                                    disabled={!monthlyMonth}
                                    onClick={printMonthly}
                                >
                                    <FileDown />
                                    Cetak / Simpan PDF
                                </Button>
                                <div className="flex gap-2">
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="flex-1 sm:flex-none"
                                    >
                                        <a
                                            href={monthlyUrl('xlsx')}
                                            onClick={(event) => {
                                                if (!monthlyMonth) {
                                                    event.preventDefault();
                                                }
                                            }}
                                        >
                                            <FileSpreadsheet />
                                            Excel
                                        </a>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="flex-1 sm:flex-none"
                                    >
                                        <a
                                            href={monthlyUrl('csv')}
                                            onClick={(event) => {
                                                if (!monthlyMonth) {
                                                    event.preventDefault();
                                                }
                                            }}
                                        >
                                            <FileText />
                                            CSV
                                        </a>
                                    </Button>
                                </div>
                            </div>
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
