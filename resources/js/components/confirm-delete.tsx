import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, LoaderCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

type Props = {
    url: string;
    itemName?: string;
    only?: string[];
    onDeleted?: () => void;
    className?: string;
    iconOnly?: boolean;
};

export default function ConfirmDelete({
    url,
    itemName,
    only,
    onDeleted,
    className,
    iconOnly = false,
}: Props) {
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const label = `Hapus ${itemName ?? 'data'}`;

    const handleDelete = () => {
        setProcessing(true);

        router.delete(url, {
            only,
            preserveScroll: true,
            onSuccess: () => {
                setProcessing(false);
                setOpen(false);
                toast.success('Data berhasil dihapus.');
                onDeleted?.();
            },
            onError: (errors) => {
                setProcessing(false);
                const message = Object.values(errors)[0];

                toast.error(
                    message ? String(message) : 'Gagal menghapus data.',
                );
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size={iconOnly ? 'icon' : 'sm'}
                    variant="destructive"
                    className={cn('text-white', className)}
                    title={iconOnly ? label : undefined}
                    aria-label={iconOnly ? label : undefined}
                >
                    <Trash2 />
                    {!iconOnly && 'Hapus'}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="size-5" />
                        Konfirmasi Hapus
                    </DialogTitle>
                    <DialogDescription>
                        Yakin ingin menghapus {itemName ?? 'data ini'}? Tindakan
                        ini tidak dapat dibatalkan.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            if (!processing) {
                                setOpen(false);
                            }
                        }}
                        disabled={processing}
                    >
                        Batal
                    </Button>
                    <Button
                        variant="destructive"
                        className="text-white"
                        onClick={handleDelete}
                        disabled={processing}
                    >
                        {processing ? (
                            <LoaderCircle className="animate-spin" />
                        ) : (
                            <Trash2 />
                        )}
                        {processing ? 'Menghapus…' : 'Hapus'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
