import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, LoaderCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Props = {
    url: string;
    itemName: string;
    className?: string;
};

export default function CancelAgenda({ url, itemName, className }: Props) {
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleCancel = () => {
        setProcessing(true);

        router.post(
            url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setProcessing(false);
                    setOpen(false);
                    toast.success('Agenda berhasil dibatalkan.');
                },
                onError: (errors) => {
                    setProcessing(false);
                    const message = Object.values(errors)[0];

                    toast.error(
                        message ? String(message) : 'Gagal membatalkan agenda.',
                    );
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Button
                size="sm"
                variant="outline"
                className={cn('gap-1.5', className)}
                onClick={() => setOpen(true)}
            >
                <X />
                Batalkan
            </Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="size-5" />
                        Batalkan Agenda
                    </DialogTitle>
                    <DialogDescription>
                        Yakin ingin membatalkan agenda “{itemName}”? Status akan
                        diubah menjadi Dibatalkan dan tidak dihitung sebagai
                        agenda berjalan.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={processing}
                    >
                        Tidak Jadi
                    </Button>
                    <Button
                        variant="destructive"
                        className="text-white"
                        onClick={handleCancel}
                        disabled={processing}
                    >
                        {processing ? (
                            <LoaderCircle className="animate-spin" />
                        ) : (
                            <X />
                        )}
                        Batalkan Agenda
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
