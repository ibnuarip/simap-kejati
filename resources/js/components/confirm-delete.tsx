import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, Trash2 } from 'lucide-react';
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
    onDeleted?: () => void;
    className?: string;
};

export default function ConfirmDelete({
    url,
    itemName,
    onDeleted,
    className,
}: Props) {
    const [open, setOpen] = useState(false);

    const handleDelete = () => {
        router.delete(url, {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                toast.success('Data berhasil dihapus.');
                onDeleted?.();
            },
            onError: () => {
                toast.error('Gagal menghapus data.');
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    variant="destructive"
                    className={cn('text-white', className)}
                >
                    <Trash2 />
                    Hapus
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
                        onClick={() => setOpen(false)}
                        disabled={false}
                    >
                        Batal
                    </Button>
                    <Button
                        variant="destructive"
                        className="text-white"
                        onClick={handleDelete}
                    >
                        <Trash2 />
                        Hapus
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
