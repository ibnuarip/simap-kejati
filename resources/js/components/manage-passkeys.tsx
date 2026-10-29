import { router } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { destroy } from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyRegistrationController';
import Heading from '@/components/heading';
import PasskeyItem, {
    type DeletePasskeyCallbacks,
} from '@/components/passkey-item';
import PasskeyRegistration from '@/components/passkey-register';
import type { Passkey } from '@/types/auth';

export type Props = {
    canManagePasskeys?: boolean;
    passkeys?: Passkey[];
};

const EmptyState = () => {
    return (
        <div className="p-8 text-center">
            <div className="bg-muted mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
                <KeyRound className="text-muted-foreground h-7 w-7" />
            </div>
            <p className="font-medium">No passkeys yet</p>
            <p className="text-muted-foreground mt-1 text-sm">
                Add a passkey to sign in without a password
            </p>
        </div>
    );
};

export default function ManagePasskeys(props: Props) {
    const passkeys = props.passkeys ?? [];

    const handleDelete = (id: number, callbacks?: DeletePasskeyCallbacks) => {
        router.delete(destroy.url(id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Passkey berhasil dihapus.');
                callbacks?.onSuccess?.();
            },
            onError: (errors) => {
                const message = Object.values(errors)[0];

                toast.error(
                    message ? String(message) : 'Gagal menghapus passkey.',
                );
                callbacks?.onError?.();
            },
            onHttpException: (response) => {
                callbacks?.onError?.();

                if (response.status === 419 || response.status === 429) {
                    return;
                }

                toast.error('Gagal menghapus passkey.');

                return false;
            },
        });
    };

    const handleRegisterSuccess = () => {
        router.reload();
    };

    if (!(props.canManagePasskeys ?? false)) {
        return null;
    }

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Passkeys"
                description="Manage your passkeys for passwordless sign-in"
            />

            <div className="border-border overflow-hidden rounded-lg border">
                {passkeys.length > 0 ? (
                    passkeys.map((passkey) => (
                        <PasskeyItem
                            key={passkey.id}
                            passkey={passkey}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <EmptyState />
                )}
            </div>

            <PasskeyRegistration onSuccess={handleRegisterSuccess} />
        </div>
    );
}
