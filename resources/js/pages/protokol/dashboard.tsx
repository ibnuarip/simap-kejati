import { Head, Link, usePage } from '@inertiajs/react';
import {
    BellRing,
    Calendar,
    CalendarCheck,
    CalendarClock,
    CalendarPlus,
    Printer,
} from 'lucide-react';
import { AgendaItemRow } from '@/components/agenda-item-row';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { dashboard as protokolDashboard } from '@/routes/protokol';
import { index as protokolEvents } from '@/routes/protokol/events';
import { index as protokolCalendar } from '@/routes/protokol/calendar';
import { index as protokolExports } from '@/routes/protokol/exports';
import type { AgendaItem } from '@/types';

type Props = {
    stats: {
        today: number;
        upcoming: number;
        month: number;
        cancelled: number;
        reminders_active: number;
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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
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
                            <CardTitle className="flex items-center gap-2">
                                <BellRing className="size-4" />
                                Status Notifikasi
                            </CardTitle>
                            <CardDescription>
                                Pengingat otomatis agenda pimpinan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="bg-accent/40 flex flex-col gap-2 rounded-lg border p-5 transition-all duration-200 hover:shadow-sm">
                                <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                                    <BellRing className="size-5" />
                                </span>
                                <p className="text-primary text-3xl font-bold tabular-nums">
                                    {stats.reminders_active}
                                </p>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    pengingat email aktif untuk agenda terjadwal
                                    7 hari ke depan.
                                </p>
                            </div>
                            <p className="text-muted-foreground text-xs">
                                Notifikasi dikirim otomatis ke email pimpinan
                                terkait jelang agenda dimulai. Pengaturan
                                penerima dapat dikelola nanti melalui menu yang
                                relevan.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
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

                    <Card>
                        <CardHeader>
                            <CardTitle>Akses Cepat</CardTitle>
                            <CardDescription>
                                Tindakan yang sering dilakukan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2.5">
                            <Button
                                asChild
                                className="group h-auto justify-start gap-3 rounded-lg p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <Link href={protokolEvents().url} prefetch>
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/20 transition-transform duration-200 group-hover:scale-105">
                                        <CalendarPlus className="size-4" />
                                    </span>
                                    <span className="flex flex-col items-start gap-0.5">
                                        <span className="font-semibold">
                                            Kelola Agenda
                                        </span>
                                        <span className="text-primary-foreground/80 text-xs">
                                            Tambah dan kelola agenda
                                        </span>
                                    </span>
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="h-auto justify-start gap-3 rounded-lg p-3 shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <Link href={protokolCalendar().url} prefetch>
                                    <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                                        <Calendar className="size-4" />
                                    </span>
                                    <span className="flex flex-col items-start gap-0.5">
                                        <span className="font-semibold">
                                            Buka Kalender
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            Pandangan kalender agenda
                                        </span>
                                    </span>
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="h-auto justify-start gap-3 rounded-lg p-3 shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <Link href={protokolExports().url} prefetch>
                                    <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                                        <Printer className="size-4" />
                                    </span>
                                    <span className="flex flex-col items-start gap-0.5">
                                        <span className="font-semibold">
                                            Cetak & Ekspor
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            Cetak dan ekspor agenda
                                        </span>
                                    </span>
                                </Link>
                            </Button>
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
