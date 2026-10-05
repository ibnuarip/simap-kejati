import { Form, Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
    CalendarPlus,
    Clock,
    MapPin,
    Pencil,
    Search,
    Tag,
    User,
    X,
} from 'lucide-react';
import EventController from '@/actions/App/Http/Controllers/Protokol/EventController';
import CancelAgenda from '@/components/cancel-agenda';
import ConfirmDelete from '@/components/confirm-delete';
import { DatetimeLocalField } from '@/components/datetime-local-field';
import InputError from '@/components/input-error';
import { ScheduleConflictAlert } from '@/components/schedule-conflict-alert';
import TablePagination from '@/components/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    agendaStatusLabel,
    agendaStatusVariant,
    eventDateKey,
    formatDateLong,
    formatTime,
} from '@/lib/agenda';
import { cn } from '@/lib/utils';
import { dashboard as protokolDashboard } from '@/routes/protokol';
import { index as eventsIndex } from '@/routes/protokol/events';
import { conflicts as eventsConflicts } from '@/routes/protokol/events';
import type {
    AgendaItem,
    AgendaStatus,
    LeaderOption,
    ResourceOption,
} from '@/types';

type Props = {
    events: AgendaItem[];
    leaders: ResourceOption[];
    rooms: ResourceOption[];
    categories: ResourceOption[];
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

const PER_PAGE = 10;
const NONE = '__none__';

function eventLocation(event: AgendaItem): string {
    return event.room?.name ?? event.custom_location ?? '-';
}

export default function ProtokolEvents({
    events,
    leaders,
    rooms,
    categories,
    statusCounts,
}: Props) {
    const [filter, setFilter] = useState<StatusFilter>('semua');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<AgendaItem | null>(null);
    const [leaderId, setLeaderId] = useState('');
    const [roomId, setRoomId] = useState(NONE);
    const [categoryId, setCategoryId] = useState(NONE);

    useEffect(() => {
        setPage(1);
    }, [filter, search]);

    const filteredEvents = useMemo(() => {
        const lowerQuery = search.trim().toLowerCase();

        return events.filter((event) => {
            const matchesStatus = filter === 'semua' || event.status === filter;
            const matchesSearch =
                lowerQuery === '' ||
                [event.title, event.leader?.name, event.room?.name]
                    .filter(Boolean)
                    .some((value) => value!.toLowerCase().includes(lowerQuery));

            return matchesStatus && matchesSearch;
        });
    }, [events, filter, search]);

    const pageCount = Math.max(1, Math.ceil(filteredEvents.length / PER_PAGE));
    const currentPage = Math.min(page, pageCount);

    const paginatedEvents = useMemo(
        () =>
            filteredEvents.slice(
                (currentPage - 1) * PER_PAGE,
                currentPage * PER_PAGE,
            ),
        [filteredEvents, currentPage],
    );

    const agendaGroups = useMemo(() => {
        const groups = new Map<string, AgendaItem[]>();

        for (const event of paginatedEvents) {
            const dateKey = eventDateKey(event);
            const group = groups.get(dateKey);

            if (group) {
                group.push(event);
            } else {
                groups.set(dateKey, [event]);
            }
        }

        return [...groups.entries()].map(([dateKey, events]) => ({
            dateKey,
            events,
        }));
    }, [paginatedEvents]);

    const leaderOptions = useMemo<LeaderOption[]>(() => {
        const base: LeaderOption[] = leaders.map((leader) => ({ ...leader }));
        const currentLeader = editing?.leader;

        if (
            currentLeader &&
            !base.some((leader) => leader.id === currentLeader.id)
        ) {
            base.unshift({
                id: currentLeader.id,
                name: `${currentLeader.name} (Nonaktif)`,
                inactive: true,
            });
        }

        return base;
    }, [leaders, editing]);

    const closeDialog = () => {
        setDialogOpen(false);
        setEditing(null);
    };

    const openCreate = () => {
        setLeaderId('');
        setRoomId(NONE);
        setCategoryId(NONE);
        setEditing(null);
        setDialogOpen(true);
    };

    const openEdit = (event: AgendaItem) => {
        setLeaderId(event.leader?.id ? String(event.leader.id) : '');
        setRoomId(event.room?.id ? String(event.room.id) : NONE);
        setCategoryId(event.category?.id ? String(event.category.id) : NONE);
        setEditing(event);
        setDialogOpen(true);
    };

    const formProps = {
        className: 'grid gap-4',
        onSuccess: closeDialog,
        options: { preserveScroll: true },
    };

    return (
        <>
            <Head title="Kelola Agenda" />

            <div className="flex flex-1 flex-col gap-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Kelola Agenda
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Tambah, perbarui, dan batalkan agenda pimpinan.
                            Status agenda dihitung otomatis sesuai waktu.
                        </p>
                    </div>
                    <Button onClick={openCreate}>
                        <CalendarPlus />
                        Tambah Agenda
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-muted-foreground text-sm font-medium">
                                Semua Agenda
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-2xl font-semibold tabular-nums">
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
                            <p className="text-2xl font-semibold tabular-nums">
                                {statusCounts.scheduled}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-muted-foreground text-sm font-medium">
                                Selesai
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-2xl font-semibold tabular-nums">
                                {statusCounts.completed}
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
                            <p className="text-2xl font-semibold tabular-nums">
                                {statusCounts.cancelled}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                        <CardTitle>Daftar Agenda</CardTitle>
                        <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
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
                                        className="min-w-0 sm:flex-none"
                                    >
                                        <span className="truncate">
                                            {option.label}
                                        </span>
                                    </Button>
                                ))}
                            </div>
                            <div className="relative w-full sm:w-64 sm:shrink-0">
                                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Cari agenda..."
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {filteredEvents.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 p-10 text-center">
                                <X className="text-muted-foreground size-6" />
                                <p className="text-muted-foreground text-sm">
                                    Tidak ada agenda yang cocok dengan filter
                                    ini.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-border divide-y">
                                {agendaGroups.map((group) => (
                                    <section key={group.dateKey}>
                                        <div className="bg-muted/50 flex items-center justify-between gap-2 px-4 py-2">
                                            <h3 className="text-sm font-semibold capitalize">
                                                {formatDateLong(group.dateKey)}
                                            </h3>
                                            <span className="text-muted-foreground text-xs tabular-nums">
                                                {group.events.length} agenda
                                            </span>
                                        </div>

                                        <ul className="grid min-w-0 grid-cols-1 gap-3 p-4 md:grid-cols-2">
                                            {group.events.map((event) => (
                                                <AgendaCard
                                                    key={event.id}
                                                    event={event}
                                                    onEdit={openEdit}
                                                />
                                            ))}
                                        </ul>
                                    </section>
                                ))}
                            </div>
                        )}

                        <TablePagination
                            page={currentPage}
                            pageCount={pageCount}
                            total={filteredEvents.length}
                            perPage={PER_PAGE}
                            onPageChange={setPage}
                        />
                    </CardContent>
                </Card>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain p-4 sm:max-w-2xl sm:p-6">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? 'Edit Agenda' : 'Tambah Agenda'}
                        </DialogTitle>
                        <DialogDescription>
                            {editing
                                ? `Perbarui agenda "${editing.title}".`
                                : 'Isi detail agenda baru.'}
                        </DialogDescription>
                    </DialogHeader>

                    {editing ? (
                        <Form
                            key={`edit-${editing.id}`}
                            {...EventController.update.form(editing.id)}
                            {...formProps}
                        >
                            {({ processing, errors }) => (
                                <>
                                    <EventFields
                                        defaultValue={editing}
                                        leaders={leaderOptions}
                                        rooms={rooms}
                                        categories={categories}
                                        leaderId={leaderId}
                                        onLeaderChange={setLeaderId}
                                        roomId={roomId}
                                        onRoomChange={setRoomId}
                                        categoryId={categoryId}
                                        onCategoryChange={setCategoryId}
                                        errors={errors}
                                        conflictsUrl={eventsConflicts().url}
                                    />
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={closeDialog}
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            Simpan
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    ) : (
                        <Form
                            key="create"
                            {...EventController.store.form()}
                            {...formProps}
                        >
                            {({ processing, errors }) => (
                                <>
                                    <EventFields
                                        defaultValue={null}
                                        leaders={leaderOptions}
                                        rooms={rooms}
                                        categories={categories}
                                        leaderId={leaderId}
                                        onLeaderChange={setLeaderId}
                                        roomId={roomId}
                                        onRoomChange={setRoomId}
                                        categoryId={categoryId}
                                        onCategoryChange={setCategoryId}
                                        errors={errors}
                                        conflictsUrl={eventsConflicts().url}
                                    />
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={closeDialog}
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            Simpan
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

type AgendaRowProps = {
    event: AgendaItem;
    onEdit: (event: AgendaItem) => void;
};

function AgendaCard({ event, onEdit }: AgendaRowProps) {
    const isCancelled = event.status === 'cancelled';

    return (
        <li
            className={cn(
                'bg-card text-card-foreground flex h-full min-w-0 flex-col rounded-xl border shadow-sm',
                isCancelled && 'opacity-70',
            )}
        >
            <div className="flex min-w-0 items-center justify-between gap-2 border-b px-4 py-2.5">
                <span className="flex min-w-0 items-center gap-1.5 text-sm font-semibold tabular-nums">
                    <Clock className="size-4 shrink-0" />
                    <span className="truncate">
                        {formatTime(event.start_time)} –{' '}
                        {formatTime(event.end_time)}
                    </span>
                </span>
                <Badge
                    variant={agendaStatusVariant[event.status]}
                    className="shrink-0"
                >
                    {agendaStatusLabel[event.status]}
                </Badge>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1 px-4 py-3">
                <p
                    className={cn(
                        'min-w-0 leading-snug font-medium break-words',
                        isCancelled && 'line-through',
                    )}
                >
                    {event.title}
                </p>

                <div className="text-muted-foreground flex min-w-0 flex-col gap-1 text-xs">
                    <span className="flex min-w-0 items-center gap-1.5">
                        <User className="size-3.5 shrink-0" />
                        <span className="truncate">
                            {event.leader?.name ?? '-'}
                        </span>
                    </span>
                    <span className="flex min-w-0 items-center gap-1.5">
                        <MapPin className="size-3.5 shrink-0" />
                        <span className="truncate">{eventLocation(event)}</span>
                    </span>
                    {event.category && (
                        <span className="flex min-w-0 items-center gap-1.5">
                            <Tag className="size-3.5 shrink-0" />
                            <span className="truncate">
                                {event.category.name}
                            </span>
                        </span>
                    )}
                </div>
            </div>

            <div className="flex shrink-0 items-center justify-end gap-2 border-t px-4 py-2.5">
                <EventActions event={event} onEdit={onEdit} />
            </div>
        </li>
    );
}

type EventActionsProps = {
    event: AgendaItem;
    onEdit: (event: AgendaItem) => void;
    align?: 'start' | 'end';
};

function EventActions({ event, onEdit, align = 'end' }: EventActionsProps) {
    return (
        <div
            className={cn(
                'flex flex-wrap items-center gap-2',
                align === 'end' ? 'justify-end' : 'justify-start',
            )}
        >
            <Button
                size="icon"
                variant="outline"
                onClick={() => onEdit(event)}
                title="Edit agenda"
                aria-label={`Edit agenda ${event.title}`}
            >
                <Pencil />
            </Button>
            {event.can_cancel && (
                <CancelAgenda
                    iconOnly
                    url={EventController.cancel.url(event.id)}
                    itemName={event.title}
                />
            )}
            <ConfirmDelete
                iconOnly
                url={EventController.destroy.url(event.id)}
                itemName={event.title}
            />
        </div>
    );
}

type FieldProps = {
    defaultValue: AgendaItem | null;
    leaders: LeaderOption[];
    rooms: ResourceOption[];
    categories: ResourceOption[];
    leaderId: string;
    onLeaderChange: (value: string) => void;
    roomId: string;
    onRoomChange: (value: string) => void;
    categoryId: string;
    onCategoryChange: (value: string) => void;
    errors: Record<string, string>;
    conflictsUrl: string;
};

function toDatetimeLocalInput(value: string | null | undefined): string {
    return value ? value.replace(' ', 'T').slice(0, 16) : '';
}

function EventFields({
    defaultValue,
    leaders,
    rooms,
    categories,
    leaderId,
    onLeaderChange,
    roomId,
    onRoomChange,
    categoryId,
    onCategoryChange,
    errors,
    conflictsUrl,
}: FieldProps) {
    const [startInput, setStartInput] = useState(
        toDatetimeLocalInput(defaultValue?.start_time),
    );
    const [endInput, setEndInput] = useState(
        toDatetimeLocalInput(defaultValue?.end_time),
    );

    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor="title">Judul Agenda</Label>
                <Input
                    id="title"
                    name="title"
                    required
                    defaultValue={defaultValue?.title}
                    placeholder="Judul kegiatan"
                />
                <InputError message={errors.title} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid min-w-0 gap-2">
                    <Label htmlFor="leader_id">Pimpinan</Label>
                    <Select value={leaderId} onValueChange={onLeaderChange}>
                        <SelectTrigger
                            id="leader_id"
                            className="w-full min-w-0 overflow-hidden [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:truncate"
                        >
                            <SelectValue placeholder="Pilih pimpinan" />
                        </SelectTrigger>
                        <SelectContent>
                            {leaders.map((leader) => (
                                <SelectItem
                                    key={leader.id}
                                    value={String(leader.id)}
                                    className="break-words whitespace-normal"
                                >
                                    {leader.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <input type="hidden" name="leader_id" value={leaderId} />
                    <InputError message={errors.leader_id} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="category_id">Kategori</Label>
                    <Select value={categoryId} onValueChange={onCategoryChange}>
                        <SelectTrigger id="category_id" className="w-full">
                            <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={NONE}>Tanpa kategori</SelectItem>
                            {categories.map((category) => (
                                <SelectItem
                                    key={category.id}
                                    value={String(category.id)}
                                >
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <input
                        type="hidden"
                        name="category_id"
                        value={categoryId === NONE ? '' : categoryId}
                    />
                    <InputError message={errors.category_id} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="room_id">Ruangan</Label>
                    <Select value={roomId} onValueChange={onRoomChange}>
                        <SelectTrigger id="room_id" className="w-full">
                            <SelectValue placeholder="Pilih ruangan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={NONE}>Tanpa ruangan</SelectItem>
                            {rooms.map((room) => (
                                <SelectItem
                                    key={room.id}
                                    value={String(room.id)}
                                >
                                    {room.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <input
                        type="hidden"
                        name="room_id"
                        value={roomId === NONE ? '' : roomId}
                    />
                    <InputError message={errors.room_id} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="custom_location">Lokasi Lain</Label>
                    <Input
                        id="custom_location"
                        name="custom_location"
                        defaultValue={defaultValue?.custom_location ?? ''}
                        placeholder="Lokasi jika di luar kantor"
                    />
                    <InputError message={errors.custom_location} />
                </div>

                <div className="grid min-w-0 gap-2">
                    <DatetimeLocalField
                        id="start_time"
                        name="start_time"
                        label="Mulai"
                        defaultValue={defaultValue?.start_time}
                        error={errors.start_time}
                        onChange={setStartInput}
                    />
                </div>

                <div className="grid min-w-0 gap-2">
                    <DatetimeLocalField
                        id="end_time"
                        name="end_time"
                        label="Selesai"
                        defaultValue={defaultValue?.end_time}
                        error={errors.end_time}
                        onChange={setEndInput}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="dress_code">Dress Code</Label>
                    <Input
                        id="dress_code"
                        name="dress_code"
                        defaultValue={defaultValue?.dress_code ?? ''}
                        placeholder="Contoh: PDH"
                    />
                    <InputError message={errors.dress_code} />
                </div>
            </div>

            <ScheduleConflictAlert
                checkUrl={conflictsUrl}
                start={startInput}
                end={endInput}
                exceptId={defaultValue?.id ?? null}
            />

            <div className="grid gap-2">
                <Label htmlFor="participants">Peserta</Label>
                <textarea
                    id="participants"
                    name="participants"
                    defaultValue={defaultValue?.participants ?? ''}
                    rows={3}
                    placeholder="Daftar peserta / pihak terkait"
                    className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                />
                <InputError message={errors.participants} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description">Deskripsi</Label>
                <textarea
                    id="description"
                    name="description"
                    defaultValue={defaultValue?.description ?? ''}
                    rows={3}
                    placeholder="Rincian kegiatan"
                    className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                />
                <InputError message={errors.description} />
            </div>
        </>
    );
}

ProtokolEvents.layout = {
    breadcrumbs: [
        { title: 'Beranda', href: protokolDashboard().url },
        { title: 'Kelola Agenda', href: eventsIndex().url },
    ],
};
