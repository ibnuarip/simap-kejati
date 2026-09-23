import { Form, Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { CalendarClock, CalendarPlus, Pencil, Search, X } from 'lucide-react';
import EventController from '@/actions/App/Http/Controllers/Operator/EventController';
import { AgendaItemRow } from '@/components/agenda-item-row';
import ConfirmDelete from '@/components/confirm-delete';
import InputError from '@/components/input-error';
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
    formatTime,
} from '@/lib/agenda';
import { dashboard } from '@/routes';
import { index as eventsIndex } from '@/routes/events';
import type { AgendaItem, AgendaStatus, ResourceOption } from '@/types';

type Props = {
    events: AgendaItem[];
    leaders: ResourceOption[];
    rooms: ResourceOption[];
    categories: ResourceOption[];
    statusCounts: {
        total: number;
        scheduled: number;
        ongoing: number;
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

const NONE = '__none__';

function toDatetimeLocal(value: string | null | undefined): string {
    return value ? value.replace(' ', 'T').slice(0, 16) : '';
}

export default function OperatorEvents({
    events,
    leaders,
    rooms,
    categories,
    statusCounts,
}: Props) {
    const [filter, setFilter] = useState<StatusFilter>('semua');
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<AgendaItem | null>(null);
    const [leaderId, setLeaderId] = useState('');
    const [roomId, setRoomId] = useState(NONE);
    const [categoryId, setCategoryId] = useState(NONE);
    const [status, setStatus] = useState<AgendaStatus>('scheduled');

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

    const closeDialog = () => {
        setDialogOpen(false);
        setEditing(null);
    };

    const openCreate = () => {
        setLeaderId('');
        setRoomId(NONE);
        setCategoryId(NONE);
        setStatus('scheduled');
        setEditing(null);
        setDialogOpen(true);
    };

    const openEdit = (event: AgendaItem) => {
        setLeaderId(event.leader?.id ? String(event.leader.id) : '');
        setRoomId(event.room?.id ? String(event.room.id) : NONE);
        setCategoryId(event.category?.id ? String(event.category.id) : NONE);
        setStatus(event.status);
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
                            Tambah, perbarui, dan atur status agenda pimpinan.
                        </p>
                    </div>
                    <Button onClick={openCreate}>
                        <CalendarPlus />
                        Tambah Agenda
                    </Button>
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
                </div>

                <div className="grid gap-4 sm:grid-cols-4">
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
                                Selesai
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-2xl font-semibold">
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
                                    Tidak ada agenda yang cocok.
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
                                                onClick={() => openEdit(event)}
                                            >
                                                <Pencil />
                                                Edit
                                            </Button>
                                            <ConfirmDelete
                                                url={EventController.destroy.url(
                                                    event.id,
                                                )}
                                                itemName={event.title}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-2xl">
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
                                        leaders={leaders}
                                        rooms={rooms}
                                        categories={categories}
                                        leaderId={leaderId}
                                        onLeaderChange={setLeaderId}
                                        roomId={roomId}
                                        onRoomChange={setRoomId}
                                        categoryId={categoryId}
                                        onCategoryChange={setCategoryId}
                                        status={status}
                                        onStatusChange={setStatus}
                                        errors={errors}
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
                                        leaders={leaders}
                                        rooms={rooms}
                                        categories={categories}
                                        leaderId={leaderId}
                                        onLeaderChange={setLeaderId}
                                        roomId={roomId}
                                        onRoomChange={setRoomId}
                                        categoryId={categoryId}
                                        onCategoryChange={setCategoryId}
                                        status={status}
                                        onStatusChange={setStatus}
                                        errors={errors}
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

type FieldProps = {
    defaultValue: AgendaItem | null;
    leaders: ResourceOption[];
    rooms: ResourceOption[];
    categories: ResourceOption[];
    leaderId: string;
    onLeaderChange: (value: string) => void;
    roomId: string;
    onRoomChange: (value: string) => void;
    categoryId: string;
    onCategoryChange: (value: string) => void;
    status: AgendaStatus;
    onStatusChange: (value: AgendaStatus) => void;
    errors: Record<string, string>;
};

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
    status,
    onStatusChange,
    errors,
}: FieldProps) {
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
                <div className="grid gap-2">
                    <Label htmlFor="leader_id">Pimpinan</Label>
                    <Select value={leaderId} onValueChange={onLeaderChange}>
                        <SelectTrigger id="leader_id" className="w-full">
                            <SelectValue placeholder="Pilih pimpinan" />
                        </SelectTrigger>
                        <SelectContent>
                            {leaders.map((leader) => (
                                <SelectItem
                                    key={leader.id}
                                    value={String(leader.id)}
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

                <div className="grid gap-2">
                    <DatetimeLocalField
                        id="start_time"
                        name="start_time"
                        label="Mulai"
                        defaultValue={defaultValue?.start_time}
                        error={errors.start_time}
                    />
                </div>

                <div className="grid gap-2">
                    <DatetimeLocalField
                        id="end_time"
                        name="end_time"
                        label="Selesai"
                        defaultValue={defaultValue?.end_time}
                        error={errors.end_time}
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

                <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={status}
                        onValueChange={(value) =>
                            onStatusChange(value as AgendaStatus)
                        }
                    >
                        <SelectTrigger id="status" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {(
                                Object.keys(agendaStatusLabel) as AgendaStatus[]
                            ).map((key) => (
                                <SelectItem key={key} value={key}>
                                    {agendaStatusLabel[key]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <input type="hidden" name="status" value={status} />
                    <InputError message={errors.status} />
                </div>
            </div>

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

type DatetimeLocalFieldProps = {
    id: string;
    name: string;
    label: string;
    defaultValue?: string | null;
    error?: string;
};

function DatetimeLocalField({
    id,
    name,
    label,
    defaultValue,
    error,
}: DatetimeLocalFieldProps) {
    const [value, setValue] = useState(
        defaultValue ? toDatetimeLocal(defaultValue) : '',
    );

    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                name={name}
                type="datetime-local"
                required
                step={60}
                value={value}
                onChange={(event) => setValue(event.target.value)}
            />
            <DatetimePreview value={value} />
            <InputError message={error} />
        </div>
    );
}

function DatetimePreview({ value }: { value: string }) {
    const parsed = useMemo(() => {
        if (!value) {
            return null;
        }

        const date = new Date(value);

        return Number.isNaN(date.getTime()) ? null : date;
    }, [value]);

    if (!parsed) {
        return null;
    }

    const formatted = new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'long',
        timeStyle: 'short',
    }).format(parsed);

    return (
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <CalendarClock className="size-3.5 shrink-0" />
            {formatted}
        </p>
    );
}

OperatorEvents.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Kelola Agenda', href: eventsIndex().url },
    ],
};
