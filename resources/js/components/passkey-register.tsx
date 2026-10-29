import { usePasskeyRegister } from '@laravel/passkeys/react';
import { useState } from 'react';
import { toast } from 'sonner';
import InlineConfirmPassword, {
    isPasswordConfirmed,
} from '@/components/inline-confirm-password';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { notifyRateLimited } from '@/hooks/use-rate-limit';

type Props = {
    onSuccess: () => void;
};

export default function PasskeyRegistration({ onSuccess }: Props) {
    const [name, setName] = useState(() => {
        const ua = navigator.userAgent;

        const browser = [
            { pattern: /Edg|Edge/, name: 'Edge' },
            { pattern: /OPR|Opera|OPiOS/, name: 'Opera' },
            { pattern: /Firefox|FxiOS/, name: 'Firefox' },
            { pattern: /Chrome|CriOS/, name: 'Chrome' },
            { pattern: /Safari/, name: 'Safari' },
        ].find(({ pattern }) => pattern.test(ua))?.name;

        const os = [
            { pattern: /iPhone/, name: 'iPhone' },
            { pattern: /iPad|Macintosh(?=.*Mobile)/, name: 'iPad' },
            { pattern: /Android/, name: 'Android' },
            { pattern: /Mac/, name: 'Mac' },
            { pattern: /Windows/, name: 'Windows' },
        ].find(({ pattern }) => pattern.test(ua))?.name;

        return [browser, os].filter(Boolean).join(' on ') || '';
    });

    const [showForm, setShowForm] = useState(false);
    const [needConfirm, setNeedConfirm] = useState(false);
    const [checking, setChecking] = useState(false);
    const { register, isLoading, error, isSupported } = usePasskeyRegister({
        onSuccess: () => {
            setName('');
            setShowForm(false);
            setNeedConfirm(false);
            toast.success('Passkey berhasil ditambahkan.');
            onSuccess();
        },
        onError: (err) => {
            if (
                err.name === 'UserCancelledError' ||
                /cancel/i.test(err.message)
            ) {
                return;
            }

            const rateLimitMatch = err.message.match(/tunggu\s+(\d+)\s+detik/i);

            if (rateLimitMatch) {
                notifyRateLimited(Number(rateLimitMatch[1]), err.message);

                return;
            }

            if (/too many|429/i.test(err.message)) {
                notifyRateLimited(60);

                return;
            }

            toast.error(err.message || 'Gagal menambahkan passkey.');
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || isLoading || checking) {
            return;
        }

        // Route registrasi passkey dijaga middleware `password.confirm`.
        // Kalau sesi belum konfirmasi, minta password dulu — kalau tidak,
        // request options-nya balik 423 dan user mentok di error.
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

        await register(name);
    };

    const handleConfirmed = async () => {
        setNeedConfirm(false);
        await register(name);
    };

    const handleCancel = () => {
        setShowForm(false);
        setNeedConfirm(false);
        setName('');
    };

    if (!isSupported) {
        return (
            <div className="text-muted-foreground text-sm">
                Passkeys are not supported in this browser.
            </div>
        );
    }

    if (!showForm) {
        return (
            <Button variant="outline" onClick={() => setShowForm(true)}>
                Add passkey
            </Button>
        );
    }

    if (needConfirm) {
        return (
            <InlineConfirmPassword
                description="Masukkan password Anda untuk melanjutkan pendaftaran passkey."
                submitLabel="Lanjutkan"
                onCancel={() => setNeedConfirm(false)}
                onConfirmed={handleConfirmed}
            />
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="border-border bg-muted/50 space-y-4 rounded-lg border p-4"
        >
            <div className="grid gap-2">
                <Label htmlFor="passkey-name">Passkey name</Label>
                <Input
                    id="passkey-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., MacBook Pro, iPhone"
                    className="border-foreground/20 mt-1 block w-full"
                    autoFocus
                />
                <p className="text-muted-foreground text-xs">
                    A name helps you identify this passkey later.
                </p>
            </div>

            {error && <InputError message={error} />}

            <div className="flex gap-2">
                <Button
                    type="submit"
                    disabled={isLoading || checking || !name.trim()}
                >
                    {checking
                        ? 'Memeriksa...'
                        : isLoading
                          ? 'Registering...'
                          : 'Register passkey'}
                </Button>
                <Button type="button" variant="ghost" onClick={handleCancel}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}
