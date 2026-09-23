import { Head, usePage } from '@inertiajs/react';
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
import { AgendaTrendChart } from '@/components/charts/agenda-trend-chart';
import { CategoryDistributionChart } from '@/components/charts/category-distribution-chart';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { agendaStatusLabel, agendaStatusVariant } from '@/lib/agenda';
import { dashboard as operatorDashboard } from '@/routes';
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

export default function Dashboard({
    stats,
    upcomingEvents,
    recentEvents,
    eventsTrend,
    categoryDistribution,
}: Props) {
    const { auth } = usePage().props;

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

            <div className="flex flex-1 flex-col gap-6 lg:gap-8">
                <div className="flex flex-col gap-1.5">
                    <p className="text-primary flex items-center gap-1.5 text-sm font-medium tabular-nums">
                        {new Date().toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </p>
                    <h1 className="text-foreground text-2xl font-bold tracking-tight md:text-3xl">
                        Selamat bekerja, {auth.user?.name}!
                    </h1>
                    <p className="text-muted-foreground max-w-2xl text-sm">
                        Ringkasan sistem dan aktivitas agenda untuk pengelolaan
                        Kepala Kejaksaan Tinggi.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {statCards.map((stat) => (
                        <Card
                            key={stat.title}
                            className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                                <CardDescription className="font-medium">
                                    {stat.title}
                                </CardDescription>
                                <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                                    <stat.icon className="size-5" />
                                </span>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-1">
                                <p className="text-primary text-3xl font-bold tabular-nums md:text-4xl">
                                    {stat.value}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarClock className="size-4" />
                                Tren Aktivitas Agenda
                            </CardTitle>
                            <CardDescription>
                                Jumlah agenda masuk per bulan dalam 6 bulan
                                terakhir.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AgendaTrendChart data={eventsTrend} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Tags className="size-4" />
                                Distribusi Kategori Kegiatan
                            </CardTitle>
                            <CardDescription>
                                Proporsi agenda berdasarkan kategori kegiatan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CategoryDistributionChart
                                data={categoryDistribution}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarClock className="size-4" />
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
                                <div className="divide-border flex flex-col divide-y">
                                    {upcomingEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className="hover:bg-muted/70 -mx-3 flex flex-col gap-3 rounded-lg px-3 py-4 transition-colors duration-200 first:mt-0 first:pt-0 last:pb-0"
                                        >
                                            <AgendaItemRow event={event} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="size-4" />
                                Ringkasan Status Agenda
                            </CardTitle>
                            <CardDescription>
                                Distribusi status seluruh agenda.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            {STATUS_KEYS.map((key) => (
                                <div
                                    key={key}
                                    className="hover:bg-muted/60 flex items-center justify-between rounded-lg border p-3 transition-colors duration-200"
                                >
                                    <Badge variant={agendaStatusVariant[key]}>
                                        {agendaStatusLabel[key]}
                                    </Badge>
                                    <span className="text-primary text-lg font-bold tabular-nums">
                                        {stats.eventsByStatus[key]}
                                    </span>
                                </div>
                            ))}
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
            href: operatorDashboard().url,
        },
    ],
};
