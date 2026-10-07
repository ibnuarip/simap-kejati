import { Form, Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    Activity,
    IdCard,
    Mail,
    Pencil,
    Phone,
    Plus,
    Search,
    X,
} from 'lucide-react';
import LeaderController from '@/actions/App/Http/Controllers/Superadmin/LeaderController';
import { ActiveToggle } from '@/components/active-toggle';
import ConfirmDelete from '@/components/confirm-delete';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { useInitials } from '@/hooks/use-initials';
import { leaderPositionLabel, leaderPositions } from '@/lib/user';
import { dashboard } from '@/routes';
import { index as leadersIndex } from '@/routes/master/leaders';
import type { Leader, LeaderPosition } from '@/types';

type Props = {
    leaders: Leader[];
};

export default function SuperadminLeaders({ leaders }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Leader | null>(null);
    const [position, setPosition] = useState<LeaderPosition>('Kajati');
    const [isActive, setIsActive] = useState(true);
    const [search, setSearch] = useState('');
    const getInitials = useInitials();

    const filteredLeaders = useMemo(() => {
        const lowerQuery = search.trim().toLowerCase();

        if (lowerQuery === '') {
            return leaders;
        }

        return leaders.filter((leader) =>
            [
                leader.name,
                leader.position,
                leaderPositionLabel[leader.position] ?? '',
                leader.nip,
                leader.email,
                leader.phone,
            ]
                .filter(Boolean)
                .some((value) => value!.toLowerCase().includes(lowerQuery)),
        );
    }, [leaders, search]);

    const closeDialog = () => {
        setDialogOpen(false);
        setEditing(null);
    };

    const openCreate = () => {
        setPosition('Kajati');
        setIsActive(true);
        setEditing(null);
        setDialogOpen(true);
    };

    const openEdit = (leader: Leader) => {
        setPosition(leader.position);
        setIsActive(leader.is_active);
        setEditing(leader);
        setDialogOpen(true);
    };

    const formProps = {
        className: 'grid gap-4',
        onSuccess: closeDialog,
        options: { preserveScroll: true },
    };

    return (
        <>
            <Head title="Data Pimpinan" />

            <div className="flex flex-1 flex-col gap-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Data Pimpinan
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Kelola daftar pimpinan Kejaksaan Tinggi dan
                            relasinya terhadap agenda.
                        </p>
                    </div>
                    <Button onClick={openCreate}>
                        <Plus />
                        Tambah Pimpinan
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle>Daftar Pimpinan</CardTitle>
                        <div className="relative w-full sm:w-64">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Cari nama, NIP, email..."
                                className="pl-9"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredLeaders.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center">
                                <X className="text-muted-foreground size-6" />
                                <p className="text-muted-foreground text-sm">
                                    {leaders.length === 0
                                        ? 'Belum ada data pimpinan. Tambahkan melalui tombol di atas.'
                                        : 'Tidak ada pimpinan yang cocok.'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {filteredLeaders.map((leader) => (
                                    <div
                                        key={leader.id}
                                        className="flex flex-col gap-4 rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                                    >
                                        <div className="flex items-start gap-3">
                                            <Avatar className="bg-primary/10 text-primary size-12 shrink-0 rounded-lg">
                                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                    {getInitials(leader.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
                                                <p className="w-full truncate font-semibold">
                                                    {leader.name}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-muted-foreground w-full text-xs">
                                                        {leaderPositionLabel[
                                                            leader.position
                                                        ] ?? leader.position}
                                                    </p>
                                                    <Badge
                                                        variant={
                                                            leader.is_active
                                                                ? 'ketua'
                                                                : 'secondary'
                                                        }
                                                    >
                                                        {leader.is_active
                                                            ? 'Aktif'
                                                            : 'Nonaktif'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t pt-4">
                                            <div className="flex flex-col gap-2.5 text-sm">
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    <Mail className="size-4 shrink-0" />
                                                    <span className="min-w-0 truncate">
                                                        {leader.email ??
                                                            'Tanpa email'}
                                                    </span>
                                                </span>
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    <Phone className="size-4 shrink-0" />
                                                    <span className="min-w-0 truncate">
                                                        {leader.phone ??
                                                            'Tanpa telepon'}
                                                    </span>
                                                </span>
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    <IdCard className="size-4 shrink-0" />
                                                    <span className="min-w-0 truncate">
                                                        {leader.nip ??
                                                            'Tanpa NIP'}
                                                    </span>
                                                </span>
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    <Activity className="size-4 shrink-0" />
                                                    <span className="min-w-0 truncate tabular-nums">
                                                        {leader.events_count}{' '}
                                                        agenda terkait
                                                    </span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-auto flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => openEdit(leader)}
                                            >
                                                <Pencil />
                                                Edit
                                            </Button>
                                            <ConfirmDelete
                                                className="flex-1"
                                                url={LeaderController.destroy.url(
                                                    leader.id,
                                                )}
                                                itemName={leader.name}
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
                <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? 'Edit Pimpinan' : 'Tambah Pimpinan'}
                        </DialogTitle>
                        <DialogDescription>
                            {editing
                                ? `Perbarui data "${editing.name}".`
                                : 'Isi detail pimpinan baru.'}
                        </DialogDescription>
                    </DialogHeader>

                    {editing ? (
                        <Form
                            key={`edit-${editing.id}`}
                            {...LeaderController.update.form(editing.id)}
                            {...formProps}
                        >
                            {({ processing, errors }) => (
                                <>
                                    <LeaderFields
                                        defaultValue={editing}
                                        position={position}
                                        onPositionChange={setPosition}
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
                            {...LeaderController.store.form()}
                            {...formProps}
                        >
                            {({ processing, errors }) => (
                                <>
                                    <LeaderFields
                                        defaultValue={null}
                                        position={position}
                                        onPositionChange={setPosition}
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
    defaultValue: Leader | null;
    position: string;
    onPositionChange: (value: string) => void;
    isActive: boolean;
    onActiveChange: (value: boolean) => void;
    errors: Record<string, string>;
};

function LeaderFields({
    defaultValue,
    position,
    onPositionChange,
    isActive,
    onActiveChange,
    errors,
}: FieldProps) {
    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                    id="name"
                    name="name"
                    required
                    defaultValue={defaultValue?.name}
                    placeholder="Nama pimpinan"
                />
                <InputError message={errors.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="position">Jabatan</Label>
                <Select
                    value={position}
                    onValueChange={(value) =>
                        onPositionChange(value as LeaderPosition)
                    }
                >
                    <SelectTrigger
                        id="position"
                        className="w-full min-w-0 [&>[data-slot='select-value']]:min-w-0"
                    >
                        <SelectValue placeholder="Pilih jabatan" />
                    </SelectTrigger>
                    <SelectContent className="max-w-[calc(100vw-2rem)]">
                        {leaderPositions.map((value) => (
                            <SelectItem key={value} value={value}>
                                <span className="block min-w-0 truncate">
                                    {leaderPositionLabel[value] ?? value}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <input type="hidden" name="position" value={position} />
                <InputError message={errors.position} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="nip">NIP</Label>
                <Input
                    id="nip"
                    name="nip"
                    required
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={18}
                    defaultValue={defaultValue?.nip ?? ''}
                    placeholder="18 digit angka"
                    onChange={(inputEvent) => {
                        inputEvent.target.value =
                            inputEvent.target.value.replace(/\D/g, '');
                    }}
                />
                <InputError message={errors.nip} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    name="email"
                    required
                    defaultValue={defaultValue?.email ?? ''}
                    placeholder="email@kejati.go.id"
                />
                <InputError message={errors.email} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="phone">No. Telepon</Label>
                <Input
                    id="phone"
                    name="phone"
                    required
                    inputMode="tel"
                    maxLength={14}
                    defaultValue={defaultValue?.phone ?? ''}
                    placeholder="08xxxxxxxxxx"
                />
                <InputError message={errors.phone} />
            </div>

            <ActiveToggle checked={isActive} onCheckedChange={onActiveChange} />
        </>
    );
}

SuperadminLeaders.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Data Pimpinan', href: leadersIndex().url },
    ],
};
