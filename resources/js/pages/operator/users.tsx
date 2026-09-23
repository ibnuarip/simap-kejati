import { Form, Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import UserController from '@/actions/App/Http/Controllers/Operator/UserController';
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
import { userRoleLabel } from '@/lib/user';
import { dashboard } from '@/routes';
import { index as usersIndex } from '@/routes/users';
import type { ManagedUser, UserRole } from '@/types';

type Props = {
    users: ManagedUser[];
};

const ROLE_OPTIONS: UserRole[] = ['operator', 'protokol', 'kajati', 'wakajati'];

export default function OperatorUsers({ users }: Props) {
    const { auth } = usePage().props;
    const currentUserId = auth.user.id;

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<ManagedUser | null>(null);
    const [role, setRole] = useState<UserRole>('operator');

    const closeDialog = () => {
        setDialogOpen(false);
        setEditing(null);
    };

    const openCreate = () => {
        setRole('operator');
        setEditing(null);
        setDialogOpen(true);
    };

    const openEdit = (user: ManagedUser) => {
        setRole(user.role);
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
                    <Button onClick={openCreate}>
                        <Plus />
                        Tambah Pengguna
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Pengguna</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {users.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center">
                                <X className="text-muted-foreground size-6" />
                                <p className="text-muted-foreground text-sm">
                                    Belum ada pengguna terdaftar.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-border flex flex-col divide-y">
                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
                                    >
                                        <div className="flex min-w-0 flex-col gap-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-medium">
                                                    {user.name}
                                                </p>
                                                <Badge>
                                                    {userRoleLabel[user.role]}
                                                </Badge>
                                                {user.id === currentUserId && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        Akun ini
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-muted-foreground text-sm">
                                                {user.email}
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                {user.email_verified_at
                                                    ? 'Email terverifikasi'
                                                    : 'Email belum terverifikasi'}{' '}
                                                • Terdaftar{' '}
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
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openEdit(user)}
                                            >
                                                <Pencil />
                                                Edit
                                            </Button>
                                            {user.id !== currentUserId && (
                                                <ConfirmDelete
                                                    url={UserController.destroy.url(
                                                        user.id,
                                                    )}
                                                    itemName={user.email}
                                                />
                                            )}
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
                                        defaultValue={editing}
                                        role={role}
                                        onRoleChange={setRole}
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
                                        defaultValue={null}
                                        role={role}
                                        onRoleChange={setRole}
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

type FieldProps = {
    defaultValue: ManagedUser | null;
    role: UserRole;
    onRoleChange: (value: UserRole) => void;
    passwordRequired: boolean;
    errors: Record<string, string>;
};

function UserFields({
    defaultValue,
    role,
    onRoleChange,
    passwordRequired,
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
                    defaultValue={defaultValue?.email}
                    placeholder="email@kejati.go.id"
                />
                <InputError message={errors.email} />
            </div>

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
            </div>
        </>
    );
}

OperatorUsers.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Kelola Pengguna', href: usersIndex().url },
    ],
};
