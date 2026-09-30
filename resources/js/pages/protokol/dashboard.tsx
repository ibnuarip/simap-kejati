import { Head, usePage } from '@inertiajs/react';
import {
    Calendar,
    CalendarCheck,
    CalendarClock,
    CalendarPlus,
} from 'lucide-react';
import { AgendaItemRow } from '@/components/agenda-item-row';
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
    stats: {
        today: number;
        upcoming: number;
        month: number;
        cancelled: number;
    };
    todayEvents: AgendaItem[];
    upcomingEvents: AgendaItem[];
};

export default function ProtokolDashboard({
    stats,
    todayEvents,
    upcomingEvents,
}: Props) {
    const { auth } = usePage().props;

    const statCards = [
        {
            title: 'Agenda Hari Ini',
            value: stats.today,
            description: 'Kegiatan yang terjadi hari ini',
            icon: CalendarClock,
        },
        {
            title: 'Agenda Mendatang',
            value: stats.upcoming,
            description: 'Terkonfirmasi ke depan',
            icon: Calendar,
        },
        {
            title: 'Agenda Bulan Ini',
            value: stats.month,
            description: 'Pada bulan berjalan',
            icon: CalendarCheck,
        },
        {
            title: 'Dibatalkan',
            value: stats.cancelled,
            description: 'Agenda berstatus batal',
            icon: CalendarPlus,
        },
    ];

    return (
        <>
            <Head title="Beranda" />

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
                        Ringkasan operasional agenda pimpinan hari ini.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                            <CardTitle>Agenda Hari Ini</CardTitle>
                            <CardDescription>
                                Kegiatan yang perlu dipantau hari ini.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            {todayEvents.length === 0 ? (
                                <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
                                    Tidak ada agenda hari ini.
                                </p>
                            ) : (
                                <div className="divide-border flex flex-col divide-y">
                                    {todayEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className="hover:bg-muted/70 -mx-3 rounded-lg px-3 py-4 transition-colors duration-200 first:mt-0 first:pt-0 last:pb-0"
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
                            <CardTitle>Agenda Mendatang</CardTitle>
                            <CardDescription>
                                5 agenda terjadwal berikutnya.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            {upcomingEvents.length === 0 ? (
                                <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
                                    Belum ada agenda mendatang.
                                </p>
                            ) : (
                                <div className="divide-border flex flex-col divide-y">
                                    {upcomingEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className="hover:bg-muted/70 -mx-3 rounded-lg px-3 py-4 transition-colors duration-200 first:mt-0 first:pt-0 last:pb-0"
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

ProtokolDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Beranda',
            href: protokolDashboard().url,
        },
    ],
};
