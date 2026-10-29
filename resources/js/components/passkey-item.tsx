import { KeyRound, Trash2 } from 'lucide-react';
import { useState } from 'react';
import InlineConfirmPassword, {
    isPasswordConfirmed,
} from '@/components/inline-confirm-password';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import type { Passkey } from '@/types/auth';

export type DeletePasskeyCallbacks = {
    onSuccess?: () => void;
    onError?: () => void;
};

type Props = {
    passkey: Passkey;
    onDelete: (id: number, callbacks?: DeletePasskeyCallbacks) => void;
};

export default function PasskeyItem({ passkey, onDelete }: Props) {
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [needConfirm, setNeedConfirm] = useState(false);
    const [checking, setChecking] = useState(false);

    const runDelete = () => {
        setIsDeleting(true);
        onDelete(passkey.id, {
            onSuccess: () => {
                setIsDeleting(false);
                setNeedConfirm(false);
                setOpen(false);
            },
            onError: () => {
                setIsDeleting(false);
                setNeedConfirm(false);
            },
        });
    };

    const handleDelete = async () => {
        if (isDeleting || checking) {
            return;
        }

        // Sama seperti registrasi: route hapus passkey dijaga middleware
        // `password.confirm`, jadi cek dulu agar tidak mentok di error.
        setChecking(true);
        const result = await isPasswordConfirmed();
        setChecking(false);

        if (result === 'rate-limited') {
            return;
        }

        if (!result) {
            setNeedConfirm(true);

            return;
        }

        runDelete();
    };

    const handleConfirmed = () => {
        setNeedConfirm(false);
        runDelete();
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (isDeleting || checking) {
            return;
        }

        setOpen(nextOpen);

        if (!nextOpen) {
            setNeedConfirm(false);
        }
    };

    return (
        <div className="flex items-center justify-between border-b p-4 last:border-b-0">
            <div className="flex items-center gap-4">
                <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                    <KeyRound className="text-muted-foreground h-5 w-5" />
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <p className="font-medium tracking-tight">
                            {passkey.name}
                        </p>
                        {passkey.authenticator && (
                            <span className="bg-muted text-muted-foreground ring-border inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase ring-1 ring-inset">
                                {passkey.authenticator}
                            </span>
                        )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Added {passkey.created_at_diff}
                        {passkey.last_used_at_diff && (
                            <>
                                <span className="text-muted-foreground/50 mx-1">
                                    /
                                </span>
                                Last used {passkey.last_used_at_diff}
                            </>
                        )}
                    </p>
                </div>
            </div>

            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogTitle>
                        {needConfirm ? 'Konfirmasi password' : 'Remove passkey'}
                    </DialogTitle>
                    <DialogDescription>
                        {needConfirm
                            ? 'Masukkan password Anda untuk menghapus passkey ini.'
                            : `Are you sure you want to remove the "${passkey.name}" passkey? You will no longer be able to use it to sign in.`}
                    </DialogDescription>

                    {needConfirm ? (
                        <InlineConfirmPassword
                            submitLabel="Hapus passkey"
                            onCancel={() => setNeedConfirm(false)}
                            onConfirmed={handleConfirmed}
                        />
                    ) : (
                        <DialogFooter className="gap-2">
                            <DialogClose asChild>
                                <Button variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isDeleting || checking}
                            >
                                {isDeleting
                                    ? 'Removing...'
                                    : checking
                                      ? 'Memeriksa...'
                                      : 'Remove passkey'}
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
