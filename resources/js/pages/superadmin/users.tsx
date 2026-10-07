import { Form, Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import UserController from '@/actions/App/Http/Controllers/Superadmin/UserController';
import ConfirmDelete from '@/components/confirm-delete';
import InputError from '@/components/input-error';
import { UserAvatar } from '@/components/user-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { leaderPositionLabel, userRoleLabel } from '@/lib/user';
import { dashboard } from '@/routes';
import { index as leadersIndex } from '@/routes/master/leaders';
import { index as usersIndex } from '@/routes/users';
import type { LeaderOption, ManagedUser, UserRole } from '@/types';

type Props = {
    users: ManagedUser[];
    leaders: LeaderOption[];
};

const ROLE_OPTIONS: UserRole[] = ['superadmin', 'protokol', 'pimpinan'];

export default function SuperadminUsers({ users, leaders }: Props) {
    const { auth } = usePage().props;
    const currentUserId = auth.user.id;

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<ManagedUser | null>(null);
    const [role, setRole] = useState<UserRole>('superadmin');
    const [leaderIds, setLeaderIds] = useState<number[]>([]);
    const [leaderId, setLeaderId] = useState<string>('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const handleLeaderChange = (id: string) => {
        setLeaderId(id);

        // Sinkronkan identitas akun dengan data pimpinan yang dipilih.
        const selected = leaders.find((leader) => String(leader.id) === id);

        if (selected) {
            setName(selected.name);
            setEmail(selected.email ?? '');
        }
    };

    const toggleLeader = (id: number) => {
        setLeaderIds((current) =>
            current.includes(id)
                ? current.filter((leaderId) => leaderId !== id)
                : [...current, id],
        );
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setEditing(null);
    };

    const openCreate = () => {
        setRole('superadmin');
        setLeaderIds([]);
        setLeaderId('');
        setName('');
        setEmail('');
        setEditing(null);
        setDialogOpen(true);
    };

    const openEdit = (user: ManagedUser) => {
        setRole(user.role);
        setLeaderIds(user.leader_ids);
        setLeaderId(user.leader_id ? String(user.leader_id) : '');
        setName(user.name);
        setEmail(user.email);
        setEditing(user);
        setDialogOpen(true);
    };

    const formProps = {
        className: 'grid gap-4',
        onSuccess: closeDialog,
        options: { preserveScroll: true },
    };

    return (
        <>
            <Head title="Kelola Pengguna" />

            <div className="flex flex-1 flex-col gap-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Kelola Pengguna
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Buat, perbarui, atur peran, dan nonaktifkan akses
                            pengguna sistem.
                        </p>
                    </div>
                    <Button onClick={openCreate} className="w-full sm:w-auto">
                        <Plus />
                        Tambah Pengguna
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Pengguna</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6">
                        {users.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center">
                                <X className="text-muted-foreground size-6" />
                                <p className="text-muted-foreground text-sm">
                                    Belum ada pengguna terdaftar.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* HP & tablet (<1024px): card list */}
                                <div className="flex flex-col gap-3 lg:hidden">
                                    {users.map((user) => (
                                        <UserCard
                                            key={user.id}
                                            user={user}
                                            currentUserId={currentUserId}
                                            onEdit={openEdit}
                                        />
                                    ))}
                                </div>

                                {/* Desktop (≥1024px): tabel scrollable */}
                                <div className="hidden overflow-x-auto lg:block">
                                    <table className="w-full min-w-[640px] text-left text-sm">
                                        <thead className="border-border text-muted-foreground border-b text-xs tracking-wide uppercase">
                                            <tr>
                                                <th className="py-3 pr-4 font-medium">
                                                    Nama & Email
                                                </th>
                                                <th className="py-3 pr-4 font-medium">
                                                    Status Email
                                                </th>
                                                <th className="py-3 pr-4 font-medium">
                                                    Terdaftar
                                                </th>
                                                <th className="py-3 text-right font-medium">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-border divide-y">
                                            {users.map((user) => (
                                                <tr
                                                    key={user.id}
                                                    className="hover:bg-muted/60 transition-colors"
                                                >
                                                    <td className="max-w-xs py-4 pr-4">
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            <UserAvatar
                                                                user={user}
                                                                className="size-9 shrink-0 overflow-hidden rounded-full"
                                                            />
                                                            <div className="flex min-w-0 flex-col gap-0.5">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <p className="truncate font-medium">
                                                                        {
                                                                            user.name
                                                                        }
                                                                    </p>
                                                                    {user.id ===
                                                                        currentUserId && (
                                                                        <Badge
                                                                            variant="secondary"
                                                                            className="text-xs"
                                                                        >
                                                                            Akun
                                                                            ini
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <p className="text-muted-foreground truncate text-xs">
                                                                    {user.email}
                                                                </p>
                                                                <p className="text-muted-foreground/80 truncate text-xs">
                                                                    {
                                                                        userRoleLabel[
                                                                            user
                                                                                .role
                                                                        ]
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="text-muted-foreground py-4 pr-4">
                                                        {user.email_verified_at
                                                            ? 'Terverifikasi'
                                                            : 'Belum terverifikasi'}
                                                    </td>
                                                    <td className="text-muted-foreground py-4 pr-4 whitespace-nowrap">
                                                        {user.created_at
                                                            ? new Date(
                                                                  user.created_at.replace(
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
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    openEdit(
                                                                        user,
                                                                    )
                                                                }
                                                            >
                                                                <Pencil />
                                                                Edit
                                                            </Button>
                                                            {user.id !==
                                                                currentUserId && (
                                                                <ConfirmDelete
                                                                    url={UserController.destroy.url(
                                                                        user.id,
                                                                    )}
                                                                    only={[
                                                                        'users',
                                                                    ]}
                                                                    itemName={
                                                                        user.email
                                                                    }
                                                                />
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? 'Edit Pengguna' : 'Tambah Pengguna'}
                        </DialogTitle>
                        <DialogDescription>
                            {editing
                                ? `Perbarui akun "${editing.email}".`
                                : 'Isi detail akun baru.'}
                        </DialogDescription>
                    </DialogHeader>

                    {editing ? (
                        <Form
                            key={`edit-${editing.id}`}
                            {...UserController.update.form(editing.id)}
                            {...formProps}
                        >
                            {({ processing, errors }) => (
                                <>
                                    <UserFields
                                        role={role}
                                        onRoleChange={setRole}
                                        leaders={leaders}
                                        leaderIds={leaderIds}
                                        onToggleLeader={toggleLeader}
                                        leaderId={leaderId}
                                        onLeaderChange={handleLeaderChange}
                                        name={name}
                                        onNameChange={setName}
                                        email={email}
                                        onEmailChange={setEmail}
                                        passwordRequired={false}
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
                            {...UserController.store.form()}
                            {...formProps}
                        >
                            {({ processing, errors }) => (
                                <>
                                    <UserFields
                                        role={role}
                                        onRoleChange={setRole}
                                        leaders={leaders}
                                        leaderIds={leaderIds}
                                        onToggleLeader={toggleLeader}
                                        leaderId={leaderId}
                                        onLeaderChange={handleLeaderChange}
                                        name={name}
                                        onNameChange={setName}
                                        email={email}
                                        onEmailChange={setEmail}
                                        passwordRequired
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

type UserCardProps = {
    user: ManagedUser;
    currentUserId: number;
    onEdit: (user: ManagedUser) => void;
};

function UserCard({ user, currentUserId, onEdit }: UserCardProps) {
    return (
        <div className="flex flex-col gap-3 rounded-lg border p-4">
            <div className="flex items-start justify-between gap-2">
                <UserAvatar
                    user={user}
                    className="size-10 shrink-0 overflow-hidden rounded-full"
                />
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium">{user.name}</p>
                        {user.id === currentUserId && (
                            <Badge variant="secondary" className="text-xs">
                                Akun ini
                            </Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground truncate text-xs">
                        {user.email}
                    </p>
                    <p className="text-muted-foreground/80 truncate text-xs">
                        {userRoleLabel[user.role]}
                    </p>
                </div>
                <ConfirmDelete
                    url={UserController.destroy.url(user.id)}
                    only={['users']}
                    itemName={user.email}
                />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <p className="text-muted-foreground text-xs">
                        Status Email
                    </p>
                    <p className="mt-0.5 text-xs">
                        {user.email_verified_at
                            ? 'Terverifikasi'
                            : 'Belum terverifikasi'}
                    </p>
                </div>
                <div>
                    <p className="text-muted-foreground text-xs">Terdaftar</p>
                    <p className="mt-0.5 text-xs">
                        {user.created_at
                            ? new Date(
                                  user.created_at.replace(' ', 'T'),
                              ).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                              })
                            : '—'}
                    </p>
                </div>
                <div>
                    <p className="text-muted-foreground text-xs">Aksi</p>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(user)}
                        className="mt-0.5"
                    >
                        <Pencil />
                        Edit
                    </Button>
                </div>
            </div>
        </div>
    );
}

type FieldProps = {
    role: UserRole;
    onRoleChange: (value: UserRole) => void;
    leaders: LeaderOption[];
    leaderIds: number[];
    onToggleLeader: (id: number) => void;
    leaderId: string;
    onLeaderChange: (value: string) => void;
    name: string;
    onNameChange: (value: string) => void;
    email: string;
    onEmailChange: (value: string) => void;
    passwordRequired: boolean;
    errors: Record<string, string>;
};

function UserFields({
    role,
    onRoleChange,
    leaders,
    leaderIds,
    onToggleLeader,
    leaderId,
    onLeaderChange,
    name,
    onNameChange,
    email,
    onEmailChange,
    passwordRequired,
    errors,
}: FieldProps) {
    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor="role">Peran (Role)</Label>
                <Select
                    value={role}
                    onValueChange={(value) => onRoleChange(value as UserRole)}
                >
                    <SelectTrigger id="role" className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {ROLE_OPTIONS.map((value) => (
                            <SelectItem key={value} value={value}>
                                {userRoleLabel[value]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <input type="hidden" name="role" value={role} />
                <InputError message={errors.role} />
            </div>

            {role === 'protokol' && (
                <div className="grid gap-2">
                    <Label>Tugas Pimpinan</Label>
                    <p className="text-muted-foreground text-xs">
                        Pilih pimpinan yang agendanya boleh dikelola akun ini.
                        Kosongkan bila belum ada penugasan.
                    </p>
                    <div className="flex flex-col gap-1 rounded-lg border p-3">
                        {leaders.length === 0 ? (
                            <p className="text-muted-foreground text-xs">
                                Belum ada data pimpinan aktif.{' '}
                                <a
                                    href={leadersIndex().url}
                                    className="text-primary font-medium underline underline-offset-4"
                                >
                                    Tambah di Data Pimpinan
                                </a>
                            </p>
                        ) : (
                            leaders.map((leader) => (
                                <label
                                    key={leader.id}
                                    className="flex cursor-pointer items-center gap-3 py-1.5"
                                >
                                    <Checkbox
                                        checked={leaderIds.includes(leader.id)}
                                        onCheckedChange={() =>
                                            onToggleLeader(leader.id)
                                        }
                                    />
                                    <span className="text-sm">
                                        {leader.name}
                                        {leader.position ? (
                                            <span className="text-muted-foreground block text-xs">
                                                {leaderPositionLabel[
                                                    leader.position
                                                ] ?? leader.position}
                                            </span>
                                        ) : null}
                                    </span>
                                </label>
                            ))
                        )}
                    </div>
                    {leaderIds.map((id) => (
                        <input
                            key={id}
                            type="hidden"
                            name="leaders[]"
                            value={id}
                        />
                    ))}
                    <InputError
                        message={errors.leaders ?? errors['leaders.0']}
                    />
                </div>
            )}

            {role === 'pimpinan' && (
                <div className="grid gap-2">
                    <Label>Tautan Data Pimpinan</Label>
                    <p className="text-muted-foreground text-xs">
                        Pilih data pimpinan yang agendanya boleh dilihat akun
                        ini. Email akun disarankan sama dengan email data
                        pimpinan agar mudah dikenali.
                    </p>
                    {leaders.length === 0 ? (
                        <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed p-4">
                            <p className="text-muted-foreground text-xs">
                                Belum ada data pimpinan. Tambahkan dulu di Data
                                Pimpinan sebelum membuat akun ini.
                            </p>
                            <a
                                href={leadersIndex().url}
                                className="text-primary text-xs font-medium underline underline-offset-4"
                            >
                                Buka Data Pimpinan
                            </a>
                        </div>
                    ) : (
                        <Select value={leaderId} onValueChange={onLeaderChange}>
                            <SelectTrigger className="h-auto min-h-9 w-full min-w-0 justify-center py-2 text-center [&>span]:line-clamp-none [&>span]:min-w-0 [&>span]:whitespace-normal sm:[&>span]:line-clamp-1">
                                <SelectValue placeholder="Pilih pimpinan">
                                    {(() => {
                                        const selected = leaders.find(
                                            (leader) =>
                                                String(leader.id) === leaderId,
                                        );

                                        if (!selected) {
                                            return null;
                                        }

                                        return (
                                            <span className="block min-w-0">
                                                <span className="block truncate font-medium">
                                                    {selected.name}
                                                </span>
                                                {selected.position ? (
                                                    <span className="text-muted-foreground block truncate text-xs font-normal">
                                                        {leaderPositionLabel[
                                                            selected.position
                                                        ] ?? selected.position}
                                                    </span>
                                                ) : null}
                                            </span>
                                        );
                                    })()}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="max-w-[calc(100vw-2rem)]">
                                {leaders.map((leader) => (
                                    <SelectItem
                                        key={leader.id}
                                        value={String(leader.id)}
                                    >
                                        <span className="flex min-w-0 flex-col items-start leading-snug">
                                            <span className="w-full truncate font-medium">
                                                {leader.name}
                                            </span>
                                            {leader.position ? (
                                                <span className="text-muted-foreground w-full truncate text-xs font-normal">
                                                    {leaderPositionLabel[
                                                        leader.position
                                                    ] ?? leader.position}
                                                </span>
                                            ) : null}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    <input type="hidden" name="leader_id" value={leaderId} />
                    <InputError message={errors.leader_id} />
                </div>
            )}

            <div className="grid gap-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                    id="name"
                    name="name"
                    required
                    value={name}
                    onChange={(event) => onNameChange(event.target.value)}
                    placeholder="Nama pengguna"
                />
                <InputError message={errors.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    name="email"
                    required
                    value={email}
                    onChange={(event) => onEmailChange(event.target.value)}
                    placeholder="email@kejati.go.id"
                />
                <InputError message={errors.email} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="password">
                    Password {passwordRequired ? '' : '(opsional)'}
                </Label>
                <Input
                    id="password"
                    type="password"
                    name="password"
                    required={passwordRequired}
                    autoComplete="new-password"
                    placeholder={
                        passwordRequired
                            ? 'Minimal 8 karakter'
                            : 'Kosongkan jika tidak diubah'
                    }
                />
                <InputError message={errors.password} />
                {passwordRequired && (
                    <p className="text-muted-foreground text-xs">
                        Email berisi kredensial akun (email & password) dikirim
                        otomatis ke email pengguna setelah disimpan.
                    </p>
                )}
            </div>
        </>
    );
}

SuperadminUsers.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Kelola Pengguna', href: usersIndex().url },
    ],
};
