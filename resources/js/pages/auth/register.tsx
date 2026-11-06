import { Head } from '@inertiajs/react';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Buat akun" />
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                }}
                className="flex flex-col gap-6"
            >
                <div className="bg-muted/60 text-muted-foreground rounded-lg border px-4 py-3 text-center text-xs leading-relaxed">
                    Pendaftaran akun mandiri dinonaktifkan.
                </div>

                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nama</Label>
                        <Input
                            id="name"
                            type="text"
                            disabled
                            tabIndex={-1}
                            autoComplete="name"
                            name="name"
                            placeholder="Full name"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Alamat Email</Label>
                        <Input
                            id="email"
                            type="email"
                            disabled
                            tabIndex={-1}
                            autoComplete="email"
                            name="email"
                            placeholder="email@example.com"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput
                            id="password"
                            disabled
                            tabIndex={-1}
                            autoComplete="new-password"
                            name="password"
                            placeholder="Password"
                            passwordrules={passwordRules}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            Konfirmasi Password
                        </Label>
                        <PasswordInput
                            id="password_confirmation"
                            disabled
                            tabIndex={-1}
                            autoComplete="new-password"
                            name="password_confirmation"
                            placeholder="Konfirmasi Password"
                            passwordrules={passwordRules}
                        />
                    </div>

                    <Button
                        type="button"
                        disabled
                        className="mt-2 w-full"
                        tabIndex={-1}
                        data-test="register-user-button"
                    >
                        Daftar
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Sudah punya akun?{' '}
                    <TextLink href={login()} tabIndex={1}>
                        Log in
                    </TextLink>
                </div>
            </form>
        </>
    );
}

Register.layout = {
    title: 'Buat akun',
    description: 'Masukkan detail Anda di bawah ini untuk membuat akun Anda',
};
