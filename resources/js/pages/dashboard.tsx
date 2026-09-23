import { Head, Link, usePage } from '@inertiajs/react';
import {
    Building2,
    CalendarCheck,
    CalendarClock,
    CalendarPlus,
    Database,
    Tags,
    UserCheck,
    UserPlus,
    Users,
} from 'lucide-react';
import { AgendaItemRow } from '@/components/agenda-item-row';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { agendaStatusLabel, agendaStatusVariant } from '@/lib/agenda';
import { index as calendarIndex } from '@/routes/calendar';
import { dashboard as operatorDashboard } from '@/routes';
import { index as eventsIndex } from '@/routes/events';
import { index as leadersIndex } from '@/routes/master/leaders';
import { index as usersIndex } from '@/routes/users';
import type { AgendaItem, DashboardRecentEvent, DashboardStats } from '@/types';

type Props = {
    stats: DashboardStats;
    upcomingEvents: AgendaItem[];
    recentEvents: DashboardRecentEvent[];
};

const STATUS_KEYS = ['scheduled', 'ongoing', 'completed', 'cancelled'] as const;

export default function Dashboard({
    stats,
    upcomingEvents,
    recentEvents,
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

                    <div className="flex flex-col gap-6">
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
                                        <Badge
                                            variant={agendaStatusVariant[key]}
                                        >
                                            {agendaStatusLabel[key]}
                                        </Badge>
                                        <span className="text-primary text-lg font-bold tabular-nums">
                                            {stats.eventsByStatus[key]}
                                        </span>
                                    </div>
                                ))}
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
                                    <Link href={eventsIndex().url} prefetch>
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
                                    <Link href={usersIndex().url} prefetch>
                                        <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                                            <UserPlus className="size-4" />
                                        </span>
                                        <span className="flex flex-col items-start gap-0.5">
                                            <span className="font-semibold">
                                                Kelola Pengguna
                                            </span>
                                            <span className="text-muted-foreground text-xs">
                                                Akun dan peran pengguna
                                            </span>
                                        </span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="h-auto justify-start gap-3 rounded-lg p-3 shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    <Link href={leadersIndex().url} prefetch>
                                        <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                                            <UserCheck className="size-4" />
                                        </span>
                                        <span className="flex flex-col items-start gap-0.5">
                                            <span className="font-semibold">
                                                Data Pimpinan
                                            </span>
                                            <span className="text-muted-foreground text-xs">
                                                Master pimpinan
                                            </span>
                                        </span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="h-auto justify-start gap-3 rounded-lg p-3 shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    <Link href={calendarIndex().url} prefetch>
                                        <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                                            <CalendarCheck className="size-4" />
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
                            </CardContent>
                        </Card>
                    </div>
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
