import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import CategoryController from '@/actions/App/Http/Controllers/Operator/CategoryController';
import ConfirmDelete from '@/components/confirm-delete';
import InputError from '@/components/input-error';
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
import { index as categoriesIndex } from '@/routes/master/categories';
import type { Category } from '@/types';

const DEFAULT_COLOR = '#008752';

type Props = {
    categories: Category[];
};

export default function OperatorCategories({ categories }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);

    const closeDialog = () => {
        setDialogOpen(false);
        setEditing(null);
    };

    const openCreate = () => {
        setEditing(null);
        setDialogOpen(true);
    };

    const formProps = {
        className: 'grid gap-4',
        onSuccess: closeDialog,
        options: { preserveScroll: true },
    };

    return (
        <>
            <Head title="Kategori Kegiatan" />

            <div className="flex flex-1 flex-col gap-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Kategori Kegiatan
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Kelola kategori yang digunakan untuk mengelompokkan
                            agenda.
                        </p>
                    </div>
                    <Button onClick={openCreate}>
                        <Plus />
                        Tambah Kategori
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Kategori</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {categories.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center">
                                <X className="text-muted-foreground size-6" />
                                <p className="text-muted-foreground text-sm">
                                    Belum ada kategori. Tambahkan melalui tombol
                                    di atas.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-border flex flex-col divide-y">
                                {categories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
                                    >
                                        <div className="flex min-w-0 flex-col gap-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span
                                                    aria-hidden
                                                    className="inline-block size-3 rounded-full border"
                                                    style={{
                                                        backgroundColor:
                                                            category.color ??
                                                            DEFAULT_COLOR,
                                                    }}
                                                />
                                                <p className="font-medium">
                                                    {category.name}
                                                </p>
                                            </div>
                                            <p className="text-muted-foreground text-sm">
                                                {category.description ??
                                                    'Tanpa deskripsi'}
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                {category.events_count} agenda
                                                terkait
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setEditing(category);
                                                    setDialogOpen(true);
                                                }}
                                            >
                                                <Pencil />
                                                Edit
                                            </Button>
                                            <ConfirmDelete
                                                url={CategoryController.destroy.url(
                                                    category.id,
                                                )}
                                                itemName={category.name}
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
                            {editing ? 'Edit Kategori' : 'Tambah Kategori'}
                        </DialogTitle>
                        <DialogDescription>
                            {editing
                                ? `Perbarui kategori "${editing.name}".`
                                : 'Isi detail kategori baru.'}
                        </DialogDescription>
                    </DialogHeader>

                    {editing ? (
                        <Form
                            key={`edit-${editing.id}`}
                            {...CategoryController.update.form(editing.id)}
                            {...formProps}
                        >
                            {({ processing, errors }) => (
                                <>
                                    <CategoryFields
                                        defaultValue={editing}
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
                            {...CategoryController.store.form()}
                            {...formProps}
                        >
                            {({ processing, errors }) => (
                                <>
                                    <CategoryFields
                                        defaultValue={null}
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
    defaultValue: Category | null;
    errors: Record<string, string>;
};

function CategoryFields({ defaultValue, errors }: FieldProps) {
    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor="name">Nama Kategori</Label>
                <Input
                    id="name"
                    name="name"
                    required
                    defaultValue={defaultValue?.name}
                    placeholder="Contoh: Rapat Pimpinan"
                />
                <InputError message={errors.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="color">Warna</Label>
                <Input
                    id="color"
                    type="color"
                    name="color"
                    defaultValue={defaultValue?.color ?? DEFAULT_COLOR}
                    className="h-9 w-full"
                />
                <InputError message={errors.color} />
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
        </>
    );
}

OperatorCategories.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Kategori Kegiatan', href: categoriesIndex().url },
    ],
};
