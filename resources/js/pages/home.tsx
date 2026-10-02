import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import { usePasskeyVerify } from '@laravel/passkeys/react';
import { Building2, KeyRound } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canUsePasskey?: boolean;
};

/**
 * Beranda (single page) sekaligus halaman login.
 *
 * Foto gedung: `public/images/gedung-kejati-jabar.png`. Jika berkas tidak
 * ditemukan, panel kiri memakai gradasi warna primer sehingga tampilan
 * tetap rapi.
 */
const BUILDING_IMAGE = '/images/gedung-kejati-jabar.png';

export default function Home({
    status,
    canResetPassword,
    canUsePasskey,
}: Props) {
    const [imageOk, setImageOk] = useState(true);
    const { verify, isLoading, error, isSupported } = usePasskeyVerify({
        onSuccess: (response) => {
            if (response.redirect) {
                window.location.href = response.redirect;
            }
        },
        onError: () => {
            // User cancelled the passkey dialog — no action needed.
            // User can retry or use the password form.
        },
    });

    return (
        <>
            <Head title="Masuk" />

            <div className="bg-background flex min-h-dvh flex-col overflow-x-clip lg:grid lg:grid-cols-2">
                <div className="relative h-[34vh] min-h-60 w-full overflow-hidden sm:h-[38vh] lg:h-auto lg:min-h-dvh">
                    <div
                        aria-hidden
                        className="from-primary via-primary/90 to-primary/70 absolute inset-0 bg-gradient-to-br"
                    />
                    {imageOk && (
                        <img
                            src={BUILDING_IMAGE}
                            alt="Gedung Kejaksaan Tinggi"
                            onError={() => setImageOk(false)}
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    )}
                    <div aria-hidden className="absolute inset-0 bg-black/45" />
                    <div className="relative z-10 flex h-full flex-col justify-end gap-2 p-6 text-white sm:gap-3 sm:p-8 lg:justify-center lg:p-12">
                        <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase opacity-90">
                            <Building2 className="size-4 shrink-0" />
                            Kejaksaan Tinggi Jawa Barat
                        </p>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                            SIMAP
                        </h1>
                        <p className="max-w-md text-sm font-medium sm:text-base">
                            Sistem Informasi Manajemen Agenda Pimpinan
                        </p>
                        <p className="hidden max-w-md text-sm leading-relaxed opacity-80 sm:block">
                            Kelola dan pantau seluruh agenda pimpinan dalam satu
                            tempat terjadwal, terdokumentasi, dan tepat waktu.
                        </p>
                    </div>
                </div>

                <div className="flex flex-1 items-center justify-center px-6 py-8 sm:px-10 sm:py-10 lg:p-12">
                    <div className="w-full max-w-sm">
                        <div className="mb-6 flex flex-col items-center gap-3 text-center">
                            <AppLogoIcon className="size-14" />
                            <div>
                                <h2 className="text-foreground text-xl font-bold tracking-tight">
                                    Selamat datang kembali
                                </h2>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    Masuk untuk mengelola agenda pimpinan
                                </p>
                            </div>
                        </div>

                        <Form
                            {...store.form()}
                            resetOnSuccess={['password']}
                            className="flex flex-col gap-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">
                                                Alamat email
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="nama@kejati.go.id"
                                            />
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <div className="flex items-center">
                                                <Label htmlFor="password">
                                                    Kata sandi
                                                </Label>
                                                {canResetPassword && (
                                                    <TextLink
                                                        href={request()}
                                                        className="ml-auto text-sm"
                                                        tabIndex={5}
                                                    >
                                                        Lupa kata sandi?
                                                    </TextLink>
                                                )}
                                            </div>
                                            <PasswordInput
                                                id="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="Kata sandi"
                                            />
                                            <InputError
                                                message={errors.password}
                                            />
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                id="remember"
                                                name="remember"
                                                tabIndex={3}
                                            />
                                            <Label htmlFor="remember">
                                                Ingat saya
                                            </Label>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="mt-4 w-full"
                                            tabIndex={4}
                                            disabled={processing}
                                            data-test="login-button"
                                        >
                                            {processing && <Spinner />}
                                            Masuk
                                        </Button>
                                    </div>

                                    <p className="text-muted-foreground text-center text-sm">
                                        Belum memiliki akun? Akun dibuat oleh
                                        operator silahkan hubungi tim SIMAP.
                                    </p>
                                </>
                            )}
                        </Form>

                        {canUsePasskey === true && isSupported && (
                            <div className="mt-6">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="border-border w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-background px-2 text-sm">
                                            atau lanjutkan dengan
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <Button
                                        type="button"
                                        data-test="passkey-login-button"
                                        variant="outline"
                                        onClick={() => verify()}
                                        disabled={isLoading}
                                        className="w-full"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center gap-2">
                                                <Spinner className="h-4 w-4" />
                                                Memverifikasi...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <KeyRound className="h-4 w-4" />
                                                Masuk dengan passkey
                                            </span>
                                        )}
                                    </Button>
                                    {error && !/cancel/i.test(error) ? (
                                        <p
                                            data-test="passkey-login-error"
                                            className="text-destructive mt-2 text-center text-sm"
                                        >
                                            {error}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        )}

                        {status && (
                            <div className="mb-4 text-center text-sm font-medium text-green-600">
                                {status}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
