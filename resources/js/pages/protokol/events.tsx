import { Head, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CalendarPlus, Search, X } from 'lucide-react';
import { AgendaItemRow } from '@/components/agenda-item-row';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    agendaStatusLabel,
    agendaStatusVariant,
    formatTime,
} from '@/lib/agenda';
import { dashboard as protokolDashboard } from '@/routes/protokol';
import type { AgendaItem, AgendaStatus } from '@/types';

type Props = {
    events: AgendaItem[];
    statusCounts: {
        total: number;
        scheduled: number;
        completed: number;
        cancelled: number;
    };
};

type StatusFilter = 'semua' | AgendaStatus;

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
    { value: 'semua', label: 'Semua' },
    { value: 'scheduled', label: 'Dijadwalkan' },
    { value: 'ongoing', label: 'Berlangsung' },
    { value: 'completed', label: 'Selesai' },
    { value: 'cancelled', label: 'Dibatalkan' },
];

export default function ProtokolEvents({ events, statusCounts }: Props) {
    const { auth } = usePage().props;
    const [filter, setFilter] = useState<StatusFilter>('semua');
    const [search, setSearch] = useState('');

    const filteredEvents = useMemo(() => {
        const lowerQuery = search.trim().toLowerCase();

        return events.filter((event) => {
            const matchesStatus = filter === 'semua' || event.status === filter;
            const matchesSearch =
                lowerQuery === '' ||
                [
                    event.title,
                    event.description,
                    event.leader?.name,
                    event.room?.name,
                ]
                    .filter(Boolean)
                    .some((value) => value!.toLowerCase().includes(lowerQuery));

            return matchesStatus && matchesSearch;
        });
    }, [events, filter, search]);

    return (
        <>
            <Head title="Kelola Agenda" />

            <div className="flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Kelola Agenda
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Tambah, perbarui, dan batalkan agenda pimpinan.
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                        {FILTER_OPTIONS.map((option) => (
                            <Button
                                key={option.value}
                                variant={
                                    filter === option.value
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() => setFilter(option.value)}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>

                    <Button
                        onClick={() =>
                            toast.info(
                                'Form tambah agenda baru akan segera hadir.',
                            )
                        }
                    >
                        <CalendarPlus />
                        Tambah Agenda Baru
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-muted-foreground text-sm font-medium">
                                Semua Agenda
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-2xl font-semibold">
                                {statusCounts.total}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-muted-foreground text-sm font-medium">
                                Dijadwalkan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-2xl font-semibold">
                                {statusCounts.scheduled}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-muted-foreground text-sm font-medium">
                                Dibatalkan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-2xl font-semibold">
                                {statusCounts.cancelled}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                        <CardTitle>Daftar Agenda</CardTitle>
                        <div className="relative w-full max-w-xs">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Cari agenda atau pimpinan..."
                                className="pl-9"
                            />
                        </div>
                    </CardHeader>

                    <CardContent>
                        {filteredEvents.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center">
                                <X className="text-muted-foreground size-6" />
                                <p className="text-muted-foreground text-sm">
                                    Tidak ada agenda yang cocok dengan filter
                                    ini.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-border flex flex-col divide-y">
                                {filteredEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <AgendaItemRow event={event} />

                                        <div className="flex shrink-0 items-center gap-2">
                                            <Badge
                                                variant={
                                                    agendaStatusVariant[
                                                        event.status
                                                    ]
                                                }
                                            >
                                                {
                                                    agendaStatusLabel[
                                                        event.status
                                                    ]
                                                }
                                            </Badge>
                                            <span className="text-muted-foreground text-xs tabular-nums">
                                                {formatTime(event.start_time)}
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    toast.info(
                                                        `Form edit untuk "${event.title}" akan segera hadir.`,
                                                    )
                                                }
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="text-white"
                                                onClick={() =>
                                                    toast.info(
                                                        `Pembatalan agenda "${event.title}" akan segera hadir.`,
                                                    )
                                                }
                                            >
                                                Batalkan
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <p className="text-muted-foreground text-xs">
                    Masuk sebagai {auth.user?.name} — formulir tambah, edit, dan
                    pembatalan agenda akan diaktifkan pada tahap berikutnya.
                </p>
            </div>
        </>
    );
}

ProtokolEvents.layout = {
    breadcrumbs: [
        { title: 'Beranda', href: protokolDashboard().url },
        { title: 'Kelola Agenda', href: '/protokol/events' },
    ],
};
