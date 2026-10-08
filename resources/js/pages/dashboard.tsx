import { Head, usePage } from '@inertiajs/react';
import { lazy, Suspense } from 'react';
import {
    Building2,
    CalendarCheck,
    CalendarClock,
    Database,
    Tags,
    UserCheck,
    Users,
} from 'lucide-react';
import { AgendaItemRow } from '@/components/agenda-item-row';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { agendaStatusLabel, agendaStatusVariant } from '@/lib/agenda';
import { dashboard as superadminDashboard } from '@/routes';
import type {
    AgendaItem,
    CategoryDistribution,
    DashboardRecentEvent,
    DashboardStats,
    EventTrendPoint,
} from '@/types';

type Props = {
    stats: DashboardStats;
    upcomingEvents: AgendaItem[];
    recentEvents: DashboardRecentEvent[];
    eventsTrend: EventTrendPoint[];
    categoryDistribution: CategoryDistribution[];
};

const STATUS_KEYS = ['scheduled', 'ongoing', 'completed', 'cancelled'] as const;

// Recharts (~300KB) dimuat malas agar paint pertama dashboard tidak
// tertahan parsing library chart. Skeleton tampil selama chunk diunduh.
const AgendaTrendChart = lazy(() =>
    import('@/components/charts/agenda-trend-chart').then((module) => ({
        default: module.AgendaTrendChart,
    })),
);

const CategoryDistributionChart = lazy(() =>
    import('@/components/charts/category-distribution-chart').then(
        (module) => ({ default: module.CategoryDistributionChart }),
    ),
);

function ChartFallback() {
    return (
        <div
            className="flex h-60 flex-col justify-end gap-2 sm:h-72"
            aria-busy="true"
            aria-label="Memuat grafik"
        >
            <div className="bg-muted flex-1 animate-pulse rounded-lg" />
            <div className="bg-muted h-4 w-2/3 animate-pulse rounded" />
        </div>
    );
}

const STATUS_DOT: Record<(typeof STATUS_KEYS)[number], string> = {
    scheduled: '#2563eb',
    ongoing: '#d97706',
    completed: '#008752',
    cancelled: '#dc2626',
};

function shortMonthLabel(date: Date): string {
    return date
        .toLocaleDateString('id-ID', { month: 'short' })
        .replace('.', '');
}

function toLocalDate(dateTime: string): Date {
    return new Date(dateTime.replace(' ', 'T'));
}

export default function Dashboard({
    stats,
    upcomingEvents,
    recentEvents,
    eventsTrend,
    categoryDistribution,
}: Props) {
    const { auth } = usePage().props;

    const trendTotal = eventsTrend.reduce((sum, point) => sum + point.total, 0);

    const statusTotal = STATUS_KEYS.reduce(
        (sum, key) => sum + (stats.eventsByStatus[key] ?? 0),
        0,
    );

    const statCards = [
        {
            title: 'Total Pengguna',
            value: stats.users,
            description: 'Akun terdaftar pada sistem',
            icon: Users,
        },
        {
            title: 'Total Agenda',
            value: stats.events,
            description: 'Seluruh kegiatan yang tercatat',
            icon: CalendarCheck,
        },
        {
            title: 'Data Pimpinan',
            value: stats.leaders,
            description: 'Pimpinan yang tercatat',
            icon: UserCheck,
        },
        {
            title: 'Ruangan & Tempat',
            value: stats.rooms,
            description: 'Lokasi kegiatan tersedia',
            icon: Building2,
        },
        {
            title: 'Kategori Kegiatan',
            value: stats.categories,
            description: 'Jenis kegiatan yang terdefinisi',
            icon: Tags,
        },
    ];

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-4 lg:gap-5">
                <div className="flex flex-col gap-1">
                    <p className="text-primary flex items-center gap-1.5 text-xs font-medium tabular-nums">
                        {new Date().toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </p>
                    <h1 className="text-foreground text-xl font-bold tracking-tight md:text-2xl">
                        Selamat bekerja, {auth.user?.name}!
                    </h1>
                    <p className="text-muted-foreground max-w-2xl text-sm">
                        Ringkasan sistem dan aktivitas agenda untuk pengelolaan
                        Kepala Kejaksaan Tinggi.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
                    {statCards.map((stat, index) => (
                        <Card
                            key={stat.title}
                            className={`transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${index === statCards.length - 1 ? 'max-sm:col-span-2' : ''} ${index === 3 ? 'order-1' : ''} ${index === 4 ? 'order-2' : ''}`}
                        >
                            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-1">
                                <CardDescription className="font-medium">
                                    {stat.title}
                                </CardDescription>
                                <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
                                    <stat.icon className="size-4" />
                                </span>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-0.5">
                                <p className="text-primary text-2xl font-bold tabular-nums md:text-3xl">
                                    {stat.value}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card className="min-w-0">
                        <CardHeader>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <CardTitle className="flex items-center gap-2">
                                        <CalendarClock className="size-4 shrink-0" />
                                        Tren Aktivitas Agenda
                                    </CardTitle>
                                    <CardDescription>
                                        Jumlah agenda masuk per bulan pada tahun
                                        berjalan.
                                    </CardDescription>
                                </div>
                                <div className="shrink-0 text-right">
                                    <p className="text-foreground text-2xl leading-none font-bold tabular-nums">
                                        {trendTotal}
                                    </p>
                                    <p className="text-muted-foreground mt-1 text-[11px] font-medium tracking-wide uppercase">
                                        Total tahun ini
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Suspense fallback={<ChartFallback />}>
                                <AgendaTrendChart data={eventsTrend} />
                            </Suspense>
                        </CardContent>
                    </Card>

                    <Card className="min-w-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Tags className="size-4 shrink-0" />
                                Distribusi Kategori Kegiatan
                            </CardTitle>
                            <CardDescription>
                                Proporsi agenda berdasarkan kategori kegiatan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Suspense fallback={<ChartFallback />}>
                                <CategoryDistributionChart
                                    data={categoryDistribution}
                                />
                            </Suspense>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="min-w-0 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarClock className="size-4 shrink-0" />
                                Agenda Mendatang
                            </CardTitle>
                            <CardDescription>
                                5 agenda terjadwal berikutnya.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {upcomingEvents.length === 0 ? (
                                <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
                                    Belum ada agenda mendatang.
                                </p>
                            ) : (
                                <ul className="divide-border flex flex-col divide-y">
                                    {upcomingEvents.map((event) => {
                                        const date = event.start_time
                                            ? toLocalDate(event.start_time)
                                            : null;

                                        return (
                                            <li
                                                key={event.id}
                                                className="hover:bg-muted/60 -mx-2 flex items-start gap-3 rounded-xl px-2 py-3.5 transition-colors duration-200 first:-mt-2 last:-mb-2"
                                            >
                                                <div className="bg-primary/10 text-primary flex size-12 shrink-0 flex-col items-center justify-center rounded-xl">
                                                    <span className="text-base leading-none font-bold tabular-nums">
                                                        {date?.getDate() ?? '—'}
                                                    </span>
                                                    <span className="mt-1 text-[10px] leading-none font-semibold tracking-wide uppercase">
                                                        {date
                                                            ? shortMonthLabel(
                                                                  date,
                                                              )
                                                            : '—'}
                                                    </span>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <AgendaItemRow
                                                        event={event}
                                                    />
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="min-w-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="size-4 shrink-0" />
                                Ringkasan Status Agenda
                            </CardTitle>
                            <CardDescription>
                                Distribusi status seluruh agenda.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3.5">
                            {STATUS_KEYS.map((key) => {
                                const value = stats.eventsByStatus[key] ?? 0;
                                const percent =
                                    statusTotal > 0
                                        ? Math.round(
                                              (value / statusTotal) * 100,
                                          )
                                        : 0;

                                return (
                                    <div
                                        key={key}
                                        className="flex flex-col gap-1.5"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                                                <span
                                                    className="size-2.5 shrink-0 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            STATUS_DOT[key],
                                                    }}
                                                />
                                                <span className="truncate">
                                                    {agendaStatusLabel[key]}
                                                </span>
                                            </span>
                                            <span className="shrink-0 text-sm tabular-nums">
                                                <span className="text-foreground font-bold">
                                                    {value}
                                                </span>{' '}
                                                <span className="text-muted-foreground text-xs font-medium">
                                                    · {percent}%
                                                </span>
                                            </span>
                                        </div>
                                        <div
                                            className="bg-muted h-1.5 overflow-hidden rounded-full"
                                            role="progressbar"
                                            aria-valuenow={percent}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                            aria-label={agendaStatusLabel[key]}
                                        >
                                            <div
                                                className="h-full rounded-full transition-[width] duration-500"
                                                style={{
                                                    width: `${percent}%`,
                                                    backgroundColor:
                                                        STATUS_DOT[key],
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="text-muted-foreground mt-1 flex items-center justify-between border-t pt-3 text-xs font-medium">
                                <span>Total agenda</span>
                                <span className="text-foreground text-sm font-bold tabular-nums">
                                    {statusTotal}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Aktivitas Input Terbaru</CardTitle>
                        <CardDescription>
                            Agenda yang baru saja dimasukkan beserta
                            penginputnya.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentEvents.length === 0 ? (
                            <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
                                Belum ada aktivitas input agenda.
                            </p>
                        ) : (
                            <div className="divide-border flex flex-col divide-y">
                                {recentEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className="hover:bg-muted/70 -mx-3 flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-3 transition-colors duration-200"
                                    >
                                        <div className="flex min-w-0 flex-col gap-1">
                                            <p className="truncate font-medium">
                                                {event.title}
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                Diinput oleh{' '}
                                                <span className="text-foreground font-medium">
                                                    {event.creator?.name ??
                                                        'Pengguna terhapus'}
                                                </span>{' '}
                                                •{' '}
                                                {event.created_at
                                                    ? new Date(
                                                          event.created_at.replace(
                                                              ' ',
                                                              'T',
                                                          ),
                                                      ).toLocaleDateString(
                                                          'id-ID',
                                                          {
                                                              day: 'numeric',
                                                              month: 'long',
                                                              year: 'numeric',
                                                          },
                                                      )
                                                    : '—'}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={
                                                agendaStatusVariant[
                                                    event.status
                                                ]
                                            }
                                        >
                                            {agendaStatusLabel[event.status]}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: superadminDashboard().url,
        },
    ],
};
