import { Head, usePage } from '@inertiajs/react';
import { Activity, Calendar, CalendarCheck, CalendarClock } from 'lucide-react';
import { AgendaItemRow } from '@/components/agenda-item-row';
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

export default function LeadershipDashboard({
    leader,
    stats,
    todayEvents,
    upcomingEvents,
}: Props) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Beranda" />

            <div className="flex flex-1 flex-col gap-6 lg:gap-8">
                <div className="flex flex-col gap-1.5">
                    <p className="text-primary flex items-center gap-1.5 text-sm font-medium">
                        {leader.position}
                    </p>
                    <h1 className="text-foreground text-2xl font-bold tracking-tight md:text-3xl">
                        Selamat pagi, {auth.user?.name}
                    </h1>
                    <p className="text-muted-foreground max-w-2xl text-sm">
                        Ringkasan kegiatan Anda hari ini dan mendatang.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                        <CardContent className="flex flex-col gap-0.5 px-4 py-3.5">
                            <span className="bg-primary/10 text-primary mb-1.5 flex size-8 items-center justify-center rounded-lg">
                                <CalendarClock className="size-4" />
                            </span>
                            <p className="text-primary text-2xl font-bold tabular-nums">
                                {stats.today}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                Hari Ini
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                        <CardContent className="flex flex-col gap-0.5 px-4 py-3.5">
                            <span className="bg-primary/10 text-primary mb-1.5 flex size-8 items-center justify-center rounded-lg">
                                <Activity className="size-4" />
                            </span>
                            <p className="text-primary text-2xl font-bold tabular-nums">
                                {stats.ongoing}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                Sedang Berlangsung
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                        <CardContent className="flex flex-col gap-0.5 px-4 py-3.5">
                            <span className="bg-primary/10 text-primary mb-1.5 flex size-8 items-center justify-center rounded-lg">
                                <Calendar className="size-4" />
                            </span>
                            <p className="text-primary text-2xl font-bold tabular-nums">
                                {stats.upcoming}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                Mendatang
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                        <CardContent className="flex flex-col gap-0.5 px-4 py-3.5">
                            <span className="bg-primary/10 text-primary mb-1.5 flex size-8 items-center justify-center rounded-lg">
                                <CalendarCheck className="size-4" />
                            </span>
                            <p className="text-primary text-2xl font-bold tabular-nums">
                                {stats.month}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                Bulan Ini
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="min-w-0">
                        <CardHeader>
                            <CardTitle>Agenda Hari Ini</CardTitle>
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
                            {todayEvents.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-8 text-center">
                                    <p className="text-sm font-medium">
                                        Tidak ada agenda hari ini
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-border flex min-w-0 flex-col divide-y">
                                    {todayEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className="hover:bg-muted/60 min-w-0 rounded-xl px-3 py-3.5 transition-colors duration-200"
                                        >
                                            <AgendaItemRow event={event} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="min-w-0">
                        <CardHeader>
                            <CardTitle>Agenda Mendatang</CardTitle>
                            <CardDescription>
                                Kegiatan terjadwal berikutnya untuk Anda.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {upcomingEvents.length === 0 ? (
                                <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
                                    Belum ada agenda mendatang.
                                </p>
                            ) : (
                                <div className="divide-border flex min-w-0 flex-col divide-y">
                                    {upcomingEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className="hover:bg-muted/60 min-w-0 rounded-xl px-3 py-3.5 transition-colors duration-200"
                                        >
                                            <AgendaItemRow event={event} />
                                        </div>
                                    ))}
                                </div>
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
