import { ClockAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRateLimit } from '@/hooks/use-rate-limit';
import { cn } from '@/lib/utils';

type Props = {
    className?: string;
};

export default function RateLimitAlert({ className }: Props) {
    const { isRateLimited, secondsLeft, message } = useRateLimit();

    if (!isRateLimited) {
        return null;
    }

    return (
        <Alert
            variant="destructive"
            data-test="rate-limit-alert"
            className={cn(className)}
        >
            <ClockAlert className="size-4" />
            <AlertTitle>Terlalu Banyak Permintaan</AlertTitle>
            <AlertDescription>
                {message ??
                    `Silakan tunggu ${secondsLeft} detik sebelum mencoba kembali.`}
            </AlertDescription>
        </Alert>
    );
}
