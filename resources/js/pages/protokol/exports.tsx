import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Calendar,
    CalendarClock,
    CalendarDays,
    CalendarRange,
    FileDown,
    FileSpreadsheet,
    FileText,
    SlidersHorizontal,
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
import { Label } from '@/components/ui/label';
import { dashboard as protokolDashboard } from '@/routes/protokol';
import {
    download as exportsDownload,
    index as exportsIndex,
    print as exportsPrint,
} from '@/routes/protokol/exports';

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

type Props = {
    defaults: {
        date: string;
        week: string;
        month: string;
        year: string;
    };
};

const PERIOD_OPTIONS: {
    value: PeriodType;
    label: string;
    icon: typeof Calendar;
}[] = [
    { value: 'daily', label: 'Harian', icon: CalendarDays },
    { value: 'weekly', label: 'Mingguan', icon: CalendarRange },
    { value: 'monthly', label: 'Bulanan', icon: Calendar },
    { value: 'yearly', label: 'Tahunan', icon: CalendarClock },
    { value: 'custom', label: 'Rentang Kustom', icon: SlidersHorizontal },
];

function formatLongDate(value: string): string {
    if (!value) {
        return '—';
    }

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatLongMonth(value: string): string {
    if (!value) {
        return '—';
    }

    const date = new Date(`${value}-02T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
    });
}

function mondayOfIsoWeek(value: string): Date | null {
    const match = /^(\d{4})-W(\d{2})$/.exec(value);

    if (!match) {
        return null;
    }

    const jan4 = new Date(Number(match[1]), 0, 4);
    const offsetToMonday = (jan4.getDay() + 6) % 7;
    const monday = new Date(jan4);

    monday.setDate(
        jan4.getDate() - offsetToMonday + (Number(match[2]) - 1) * 7,
    );

    return monday;
}

function formatWeekRange(value: string): string {
    const monday = mondayOfIsoWeek(value);

    if (!monday) {
        return '—';
    }

    const sunday = new Date(monday);

    sunday.setDate(monday.getDate() + 6);

    const format = (date: Date) =>
        date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

    return `${format(monday)} - ${format(sunday)}`;
}

export default function ProtokolExports({ defaults }: Props) {
    const [periodType, setPeriodType] = useState<PeriodType>('monthly');
    const [date, setDate] = useState(defaults.date);
    const [week, setWeek] = useState(defaults.week);
    const [month, setMonth] = useState(defaults.month);
    const [year, setYear] = useState(defaults.year);
    const [start, setStart] = useState(defaults.date);
    const [end, setEnd] = useState(defaults.date);

    const customInvalid =
        periodType === 'custom' && !!start && !!end && end < start;

    const periodParams = (): Record<string, string> => {
        switch (periodType) {
            case 'weekly':
                return { type: 'weekly', week };
            case 'monthly':
                return { type: 'monthly', month };
            case 'yearly':
                return { type: 'yearly', year };
            case 'custom':
                return { type: 'custom', start, end };
            default:
                return { type: 'daily', date };
        }
    };

    const periodSummary = (): string => {
        switch (periodType) {
            case 'weekly':
                return week ? formatWeekRange(week) : '—';
            case 'monthly':
                return month ? formatLongMonth(month) : '—';
            case 'yearly':
                return year || '—';
            case 'custom':
                return start && end
                    ? `${formatLongDate(start)} - ${formatLongDate(end)}`
                    : '—';
            default:
                return date ? formatLongDate(date) : '—';
        }
    };

    const canSubmit =
        !customInvalid &&
        (periodType !== 'daily' || !!date) &&
        (periodType !== 'weekly' || !!week) &&
        (periodType !== 'monthly' || !!month) &&
        (periodType !== 'yearly' || !!year) &&
        (periodType !== 'custom' || (!!start && !!end));

    const handlePrint = () => {
        if (!canSubmit) {
            return;
        }

        router.get(exportsPrint().url, periodParams());
    };

    const downloadUrl = (format: 'xlsx' | 'csv') =>
        exportsDownload.url({
            query: { ...periodParams(), format },
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
                        Pilih periode laporan lalu cetak atau unduh dalam format
                        PDF, Excel, atau CSV.
                    </p>
                </div>

                <div className="grid gap-6 md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
                    <Card className="min-w-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileDown className="size-4 shrink-0" />
                                Rekap Agenda
                            </CardTitle>
                            <CardDescription>
                                Harian, mingguan, bulanan, tahunan, atau rentang
                                tanggal kustom dalam zona waktu Asia/Jakarta.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex min-w-0 flex-col gap-5">
                            <div
                                role="radiogroup"
                                aria-label="Jenis periode"
                                className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
                            >
                                {PERIOD_OPTIONS.map((option, index) => {
                                    const active = periodType === option.value;

                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            role="radio"
                                            aria-checked={active}
                                            title={option.label}
                                            onClick={() =>
                                                setPeriodType(option.value)
                                            }
                                            className={`flex min-w-0 items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 text-sm font-medium whitespace-nowrap transition-colors duration-200 sm:gap-2 sm:px-3 ${
                                                index ===
                                                PERIOD_OPTIONS.length - 1
                                                    ? 'max-sm:col-span-2'
                                                    : ''
                                            } ${
                                                active
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                                            }`}
                                        >
                                            <option.icon className="size-4 shrink-0" />
                                            <span className="truncate">
                                                {option.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {periodType === 'daily' && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="periode-tanggal">
                                            Tanggal
                                        </Label>
                                        <Input
                                            id="periode-tanggal"
                                            type="date"
                                            value={date}
                                            onChange={(event) =>
                                                setDate(event.target.value)
                                            }
                                        />
                                    </div>
                                )}

                                {periodType === 'weekly' && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="periode-minggu">
                                            Minggu (Senin–Ahad)
                                        </Label>
                                        <Input
                                            id="periode-minggu"
                                            type="week"
                                            value={week}
                                            onChange={(event) =>
                                                setWeek(event.target.value)
                                            }
                                        />
                                    </div>
                                )}

                                {periodType === 'monthly' && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="periode-bulan">
                                            Bulan
                                        </Label>
                                        <Input
                                            id="periode-bulan"
                                            type="month"
                                            value={month}
                                            onChange={(event) =>
                                                setMonth(event.target.value)
                                            }
                                        />
                                    </div>
                                )}

                                {periodType === 'yearly' && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="periode-tahun">
                                            Tahun
                                        </Label>
                                        <Input
                                            id="periode-tahun"
                                            type="number"
                                            min={2000}
                                            max={2100}
                                            value={year}
                                            onChange={(event) =>
                                                setYear(event.target.value)
                                            }
                                        />
                                    </div>
                                )}

                                {periodType === 'custom' && (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="periode-mulai">
                                                Tanggal mulai
                                            </Label>
                                            <Input
                                                id="periode-mulai"
                                                type="date"
                                                value={start}
                                                max={end || undefined}
                                                onChange={(event) =>
                                                    setStart(event.target.value)
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="periode-selesai">
                                                Tanggal selesai
                                            </Label>
                                            <Input
                                                id="periode-selesai"
                                                type="date"
                                                value={end}
                                                min={start || undefined}
                                                onChange={(event) =>
                                                    setEnd(event.target.value)
                                                }
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            {customInvalid && (
                                <p
                                    role="alert"
                                    className="text-destructive border-destructive/30 bg-destructive/5 rounded-lg border px-3 py-2 text-sm font-medium"
                                >
                                    Tanggal selesai tidak boleh sebelum tanggal
                                    mulai.
                                </p>
                            )}

                            <div className="flex items-center gap-3 rounded-lg border p-4">
                                <CalendarRange className="text-primary size-10 shrink-0" />
                                <p className="text-muted-foreground min-w-0 text-sm">
                                    Periode terpilih:{' '}
                                    <span className="text-foreground font-semibold">
                                        {periodSummary()}
                                    </span>
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Button
                                    variant="outline"
                                    className="w-full sm:w-auto"
                                    disabled={!canSubmit}
                                    onClick={handlePrint}
                                >
                                    <FileDown />
                                    Cetak / Simpan PDF
                                </Button>
                                <div className="flex gap-2">
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="flex-1 sm:flex-none"
                                        disabled={!canSubmit}
                                    >
                                        <a
                                            href={
                                                canSubmit
                                                    ? downloadUrl('xlsx')
                                                    : undefined
                                            }
                                            onClick={(event) => {
                                                if (!canSubmit) {
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
                                        disabled={!canSubmit}
                                    >
                                        <a
                                            href={
                                                canSubmit
                                                    ? downloadUrl('csv')
                                                    : undefined
                                            }
                                            onClick={(event) => {
                                                if (!canSubmit) {
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
