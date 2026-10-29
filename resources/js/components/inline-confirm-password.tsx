import { useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Label } from '@/components/ui/label';
import { notifyRateLimited } from '@/hooks/use-rate-limit';
import { confirmation } from '@/routes/password';
import { store as confirmStore } from '@/routes/password/confirm';

type ConfirmResponse = {
    message?: string;
    retry_after?: number;
    errors?: { password?: string[] };
};

function getXsrfToken(): string | null {
    const match = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='));

    return match ? decodeURIComponent(match.split('=')[1]) : null;
}

/**
 * Apakah sesi ini sudah pernah mengonfirmasi password (dalam batas
 * `auth.password_timeout`)? Route manage passkey dijaga middleware
 * `password.confirm`, jadi status ini dicek dulu sebelum memulai
 * ceremoni WebAuthn agar user tidak mentok di error 423.
 */
export async function isPasswordConfirmed(): Promise<boolean | 'rate-limited'> {
    try {
        const response = await fetch(confirmation.url(), {
            headers: { Accept: 'application/json' },
            credentials: 'same-origin',
        });

        if (response.status === 429) {
            const data = (await response
                .json()
                .catch(() => null)) as ConfirmResponse | null;
            const retryAfter =
                data?.retry_after ??
                Number(response.headers.get('retry-after'));
            notifyRateLimited(retryAfter, data?.message);

            return 'rate-limited';
        }

        if (!response.ok) {
            return false;
        }

        const data = (await response.json().catch(() => null)) as {
            confirmed?: boolean;
        } | null;

        return data?.confirmed === true;
    } catch {
        return false;
    }
}

type Props = {
    onConfirmed: () => void | Promise<void>;
    onCancel?: () => void;
    submitLabel?: string;
    description?: string;
};

/**
 * Form konfirmasi password inline (tanpa pindah halaman). Dipakai di
 * alur tambah/hapus passkey: bila sesi belum terkonfirmasi, minta
 * password di sini dulu, lalu teruskan aksi yang semula diminta.
 */
export default function InlineConfirmPassword({
    onConfirmed,
    onCancel,
    submitLabel = 'Continue',
    description,
}: Props) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password || processing) {
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const token = getXsrfToken();
            const response = await fetch(confirmStore.url(), {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    ...(token ? { 'X-XSRF-TOKEN': token } : {}),
                },
                body: JSON.stringify({ password }),
            });

            if (response.ok) {
                setPassword('');
                await onConfirmed();

                return;
            }

            const data = (await response
                .json()
                .catch(() => null)) as ConfirmResponse | null;

            if (response.status === 429) {
                const retryAfter =
                    data?.retry_after ??
                    Number(response.headers.get('retry-after'));
                notifyRateLimited(retryAfter, data?.message);
                setError(
                    data?.message ??
                        'Silakan tunggu beberapa saat sebelum mencoba kembali.',
                );

                return;
            }

            setError(
                data?.errors?.password?.[0] ??
                    data?.message ??
                    'Konfirmasi password gagal. Coba lagi.',
            );
        } catch {
            setError('Terjadi kesalahan jaringan. Coba lagi.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {description && (
                <p className="text-muted-foreground text-sm">{description}</p>
            )}

            <div className="grid gap-2">
                <Label htmlFor="inline-confirm-password">Password</Label>
                <PasswordInput
                    id="inline-confirm-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password Anda"
                    autoComplete="current-password"
                    autoFocus
                />
                {error && <InputError message={error} />}
            </div>

            <div className="flex gap-2">
                <Button type="submit" disabled={processing || !password.trim()}>
                    {processing && <Spinner className="h-4 w-4" />}
                    {submitLabel}
                </Button>
                {onCancel && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        disabled={processing}
                    >
                        Batal
                    </Button>
                )}
            </div>
        </form>
    );
}
