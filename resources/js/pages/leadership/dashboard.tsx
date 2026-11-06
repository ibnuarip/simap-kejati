import { Head, usePage } from '@inertiajs/react';
import { Activity, Calendar, CalendarCheck, CalendarClock } from 'lucide-react';
import { AgendaItemRow } from '@/components/agenda-item-row';
import {
    AgendaListSkeleton,
    StatCardContentSkeleton,
    useDashboardLoading,
} from '@/components/dashboard-skeleton';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard as leadershipDashboard } from '@/routes/leadership';
import type { AgendaItem } from '@/types';

type Props = {
    leader: {
        name: string;
        position: string;
    };
    stats: {
        today: number;
        ongoing: number;
        upcoming: number;
        month: number;
    };
    todayEvents: AgendaItem[];
    upcomingEvents: AgendaItem[];
};

function shortMonthLabel(date: Date): string {
    return date
        .toLocaleDateString('id-ID', { month: 'short' })
        .replace('.', '');
}

function toLocalDate(dateTime: string): Date {
    return new Date(dateTime.replace(' ', 'T'));
}

export default function LeadershipDashboard({
    leader,
    stats,
    todayEvents,
    upcomingEvents,
}: Props) {
    const { auth } = usePage().props;
    const { isLoading } = useDashboardLoading();
    const hour = new Date().getHours();
    const greeting =
        hour >= 4 && hour < 11
            ? 'Selamat pagi'
            : hour >= 11 && hour < 15
              ? 'Selamat siang'
              : hour >= 15 && hour < 18
                ? 'Selamat sore'
                : 'Selamat malam';

    const statCards = [
        {
            title: 'Hari Ini',
            value: stats.today,
            description: 'Agenda Anda hari ini',
            icon: CalendarClock,
        },
        {
            title: 'Sedang Berlangsung',
            value: stats.ongoing,
            description: 'Kegiatan yang sedang berjalan',
            icon: Activity,
        },
        {
            title: 'Mendatang',
            value: stats.upcoming,
            description: 'Agenda terjadwal berikutnya',
            icon: Calendar,
        },
        {
            title: 'Bulan Ini',
            value: stats.month,
            description: 'Total agenda bulan berjalan',
            icon: CalendarCheck,
        },
    ];

    return (
        <>
            <Head title="Beranda" />

            <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-1 flex-col gap-3.5 duration-300 2xl:gap-5">
                <div className="flex flex-col gap-0.5 2xl:gap-1">
                    <p className="text-primary flex items-center gap-1.5 text-xs font-medium">
                        {leader.position}
                    </p>
                    <h1 className="text-foreground text-xl font-bold tracking-tight md:text-2xl">
                        {greeting}, {auth.user?.name}
                    </h1>
                    <p className="text-muted-foreground max-w-2xl text-xs sm:text-sm">
                        Ringkasan kegiatan Anda hari ini dan mendatang.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {statCards.map((stat) => (
                        <Card
                            key={stat.title}
                            className="justify-between gap-1.5 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md 2xl:gap-2 2xl:py-3"
                        >
                            <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 px-3.5 pb-0">
                                <CardDescription className="line-clamp-2 text-xs leading-snug font-medium">
                                    {stat.title}
                                </CardDescription>
                                <span className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-md">
                                    <stat.icon className="size-3.5" />
                                </span>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-0.5 px-3.5">
                                {isLoading ? (
                                    <StatCardContentSkeleton />
                                ) : (
                                    <>
                                        <p className="text-primary text-xl font-bold tabular-nums md:text-2xl">
                                            {stat.value}
                                        </p>
                                        <p className="text-muted-foreground line-clamp-1 text-[11px]">
                                            {stat.description}
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-3.5 lg:grid-cols-2 2xl:gap-4">
                    <Card className="min-w-0 gap-3.5 py-4 2xl:gap-6 2xl:py-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarCheck className="size-4 shrink-0" />
                                Agenda Hari Ini
                            </CardTitle>
                            <CardDescription>
                                {new Date().toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <AgendaListSkeleton count={3} />
                            ) : todayEvents.length === 0 ? (
                                <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
                                    Tidak ada agenda hari ini
                                </p>
                            ) : (
                                <ul className="divide-border flex flex-col divide-y">
                                    {todayEvents.map((event) => {
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

                    <Card className="min-w-0 gap-3.5 py-4 2xl:gap-6 2xl:py-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarClock className="size-4 shrink-0" />
                                Agenda Mendatang
                            </CardTitle>
                            <CardDescription>
                                Kegiatan terjadwal berikutnya untuk Anda.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <AgendaListSkeleton count={3} />
                            ) : upcomingEvents.length === 0 ? (
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
                </div>
            </div>
        </>
    );
}

LeadershipDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Beranda',
            href: leadershipDashboard().url,
        },
    ],
};
