import { Form } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { ShieldAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { disable } from '@/routes/settings/two-factor';

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

export default function TwoFactorDisableModal({ isOpen, onClose }: Props) {
    const [code, setCode] = useState<string>('');
    const pinInputContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setCode('');

            setTimeout(() => {
                pinInputContainerRef.current?.querySelector('input')?.focus();
            }, 0);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldAlert className="size-5" />
                        Nonaktifkan Autentikasi Dua Langkah
                    </DialogTitle>
                    <DialogDescription>
                        Masukkan kode 6 digit dari aplikasi autentikator untuk
                        memverifikasi sebelum fitur dinonaktifkan.
                    </DialogDescription>
                </DialogHeader>

                <Form
                    {...disable.form()}
                    resetOnError
                    resetOnSuccess
                    onSuccess={onClose}
                >
                    {({ processing, errors }) => (
                        <>
                            <div
                                ref={pinInputContainerRef}
                                className="flex flex-col items-center space-y-3 py-2"
                            >
                                <InputOTP
                                    id="code"
                                    name="code"
                                    maxLength={OTP_MAX_LENGTH}
                                    onChange={setCode}
                                    disabled={processing}
                                    pattern={REGEXP_ONLY_DIGITS}
                                    autoFocus
                                >
                                    <InputOTPGroup>
                                        {Array.from(
                                            { length: OTP_MAX_LENGTH },
                                            (_, index) => (
                                                <InputOTPSlot
                                                    key={index}
                                                    index={index}
                                                />
                                            ),
                                        )}
                                    </InputOTPGroup>
                                </InputOTP>
                                <InputError message={errors?.code} />
                            </div>

                            <div className="mt-4 flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={processing}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    className="text-white"
                                    disabled={
                                        processing ||
                                        code.length < OTP_MAX_LENGTH
                                    }
                                >
                                    Nonaktifkan 2FA
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
