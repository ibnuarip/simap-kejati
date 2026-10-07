import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import RoomController from '@/actions/App/Http/Controllers/Operator/RoomController';
import { ActiveToggle } from '@/components/active-toggle';
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
import { dashboard } from '@/routes';
import { index as roomsIndex } from '@/routes/master/rooms';
import type { Room } from '@/types';

type Props = {
    rooms: Room[];
};

export default function OperatorRooms({ rooms }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Room | null>(null);
    const [isActive, setIsActive] = useState(true);

    const closeDialog = () => {
        setDialogOpen(false);
        setEditing(null);
    };

    const openCreate = () => {
        setIsActive(true);
        setEditing(null);
        setDialogOpen(true);
    };

    const openEdit = (room: Room) => {
        setIsActive(room.is_active);
        setEditing(room);
        setDialogOpen(true);
    };

    const formProps = {
        className: 'grid gap-4',
        onSuccess: closeDialog,
        options: { preserveScroll: true },
    };

    return (
        <>
            <Head title="Data Ruangan & Tempat" />

            <div className="flex flex-1 flex-col gap-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Data Ruangan & Tempat
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Kelola ruangan dan lokasi kegiatan pimpinan.
                        </p>
                    </div>
                    <Button onClick={openCreate}>
                        <Plus />
                        Tambah Ruangan
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Ruangan & Tempat</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {rooms.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center">
                                <X className="text-muted-foreground size-6" />
                                <p className="text-muted-foreground text-sm">
                                    Belum ada data ruangan. Tambahkan melalui
                                    tombol di atas.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-border flex flex-col divide-y">
                                {rooms.map((room) => (
                                    <div
                                        key={room.id}
                                        className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
                                    >
                                        <div className="flex min-w-0 flex-col gap-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-medium">
                                                    {room.name}
                                                </p>
                                                {!room.is_active && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        Nonaktif
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-muted-foreground text-sm">
                                                {room.location ??
                                                    'Lokasi belum diatur'}
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                Kapasitas{' '}
                                                {room.capacity ??
                                                    'tidak ditentukan'}{' '}
                                                orang • {room.events_count}{' '}
                                                agenda terkait
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openEdit(room)}
                                            >
                                                <Pencil />
                                                Edit
                                            </Button>
                                            <ConfirmDelete
                                                url={RoomController.destroy.url(
                                                    room.id,
                                                )}
                                                itemName={room.name}
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
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? 'Edit Ruangan' : 'Tambah Ruangan'}
                        </DialogTitle>
                        <DialogDescription>
                            {editing
                                ? `Perbarui data "${editing.name}".`
                                : 'Isi detail ruangan baru.'}
                        </DialogDescription>
                    </DialogHeader>

                    {editing ? (
                        <Form
                            key={`edit-${editing.id}`}
                            {...RoomController.update.form(editing.id)}
                            {...formProps}
                        >
                            {({ processing, errors }) => (
                                <>
                                    <RoomFields
                                        defaultValue={editing}
                                        isActive={isActive}
                                        onActiveChange={setIsActive}
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
                            {...RoomController.store.form()}
                            {...formProps}
                        >
                            {({ processing, errors }) => (
                                <>
                                    <RoomFields
                                        defaultValue={null}
                                        isActive={isActive}
                                        onActiveChange={setIsActive}
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
    defaultValue: Room | null;
    isActive: boolean;
    onActiveChange: (value: boolean) => void;
    errors: Record<string, string>;
};

function RoomFields({
    defaultValue,
    isActive,
    onActiveChange,
    errors,
}: FieldProps) {
    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor="name">Nama Ruangan</Label>
                <Input
                    id="name"
                    name="name"
                    required
                    defaultValue={defaultValue?.name}
                    placeholder="Nama ruangan / lokasi"
                />
                <InputError message={errors.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="location">Lokasi</Label>
                <Input
                    id="location"
                    name="location"
                    defaultValue={defaultValue?.location ?? ''}
                    placeholder="Gedung / lantai / alamat"
                />
                <InputError message={errors.location} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="capacity">Kapasitas (orang)</Label>
                <Input
                    id="capacity"
                    type="number"
                    name="capacity"
                    min={1}
                    defaultValue={defaultValue?.capacity ?? ''}
                    placeholder="Contoh: 50"
                />
                <InputError message={errors.capacity} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description">Deskripsi</Label>
                <textarea
                    id="description"
                    name="description"
                    defaultValue={defaultValue?.description ?? ''}
                    rows={3}
                    placeholder="Keterangan tambahan"
                    className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                />
                <InputError message={errors.description} />
            </div>

            <ActiveToggle checked={isActive} onCheckedChange={onActiveChange} />
        </>
    );
}

OperatorRooms.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Data Ruangan & Tempat', href: roomsIndex().url },
    ],
};
