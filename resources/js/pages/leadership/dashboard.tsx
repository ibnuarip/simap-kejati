import { Head, Link, usePage } from '@inertiajs/react';
import {
    BellRing,
    Calendar,
    CalendarCheck,
    CalendarClock,
    ChevronRight,
} from 'lucide-react';
import { AgendaItemRow } from '@/components/agenda-item-row';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard as leadershipDashboard } from '@/routes/leadership';
import { index as leadershipCalendar } from '@/routes/leadership/calendar';
import { index as leadershipNotifications } from '@/routes/leadership/notifications';
import type { AgendaItem, UserRole } from '@/types';

type Props = {
    stats: {
        today: number;
        upcoming: number;
        month: number;
    };
    todayEvents: AgendaItem[];
    upcomingEvents: AgendaItem[];
};

const positionLabel: Record<'kajati' | 'wakajati', string> = {
    kajati: 'Kepala Kejaksaan Tinggi',
    wakajati: 'Wakil Kepala Kejaksaan Tinggi',
};

export default function LeadershipDashboard({
    stats,
    todayEvents,
    upcomingEvents,
}: Props) {
    const { auth } = usePage().props;
    const role = (auth.user?.role ?? 'kajati') as UserRole;
    const position =
        role === 'wakajati' ? positionLabel.wakajati : positionLabel.kajati;

    return (
        <>
            <Head title="Beranda" />

            <div className="flex flex-1 flex-col gap-6 lg:gap-8">
                <div className="flex flex-col gap-1.5">
                    <p className="text-primary flex items-center gap-1.5 text-sm font-medium">
                        {position}
                    </p>
                    <h1 className="text-foreground text-2xl font-bold tracking-tight md:text-3xl">
                        Selamat pagi, {auth.user?.name}
                    </h1>
                    <p className="text-muted-foreground max-w-2xl text-sm">
                        Ringkasan kegiatan Anda hari ini dan mendatang.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                        <CardContent className="flex flex-col gap-1 px-4 py-4">
                            <span className="bg-primary/10 text-primary mb-2 flex size-9 items-center justify-center rounded-lg">
                                <CalendarClock className="size-5" />
                            </span>
                            <p className="text-primary text-3xl font-bold tabular-nums">
                                {stats.today}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                Hari Ini
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                        <CardContent className="flex flex-col gap-1 px-4 py-4">
                            <span className="bg-primary/10 text-primary mb-2 flex size-9 items-center justify-center rounded-lg">
                                <Calendar className="size-5" />
                            </span>
                            <p className="text-primary text-3xl font-bold tabular-nums">
                                {stats.upcoming}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                Mendatang
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                        <CardContent className="flex flex-col gap-1 px-4 py-4">
                            <span className="bg-primary/10 text-primary mb-2 flex size-9 items-center justify-center rounded-lg">
                                <CalendarCheck className="size-5" />
                            </span>
                            <p className="text-primary text-3xl font-bold tabular-nums">
                                {stats.month}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                Bulan Ini
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                        <div>
                            <CardTitle>Agenda Hari Ini</CardTitle>
                            <CardDescription>
                                {new Date().toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </CardDescription>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href={leadershipCalendar().url} prefetch>
                                Buka Kalender
                                <ChevronRight />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {todayEvents.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-8 text-center">
                                <p className="text-sm font-medium">
                                    Tidak ada agenda hari ini
                                </p>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    Nikmati waktu Anda. Agenda berikutnya dapat
                                    dilihat di bawah.
                                </p>
                            </div>
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

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
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

                    <div className="flex flex-col gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BellRing className="size-4" />
                                    Pengaturan Notifikasi
                                </CardTitle>
                                <CardDescription>
                                    Atur email penerima pengingat agenda.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button asChild variant="outline">
                                    <Link
                                        href={leadershipNotifications().url}
                                        prefetch
                                    >
                                        Kelola Pengaturan
                                        <ChevronRight />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="bg-accent/40 flex items-start gap-3 rounded-xl border p-4 text-sm transition-all duration-200 hover:shadow-sm">
                            <BellRing className="text-primary size-4 shrink-0" />
                            Pengingat otomatis akan dikirim ke email Anda
                            sebelum agenda dimulai sesuai pengaturan yang
                            dipilih.
                        </div>
                    </div>
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
