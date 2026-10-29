import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import {
    clearRateLimit,
    extractRetryAfterFromInertiaResponse,
    notifyRateLimited,
} from '@/hooks/use-rate-limit';
import type { FlashToast } from '@/types/ui';

type HttpExceptionDetail = {
    response?: {
        status?: number;
        headers?: Record<string, string | undefined>;
        data?: unknown;
    };
};

export function useFlashToast(): void {
    useEffect(() => {
        const stopFlash = router.on('flash', (event) => {
            const flash = (event as CustomEvent).detail?.flash;
            const data = flash?.toast as FlashToast | undefined;

            if (!data) {
                return;
            }

            toast[data.type](data.message);
        });

        const stopHttpException = router.on('httpException', (event) => {
            const response = (event.detail as HttpExceptionDetail | undefined)
                ?.response;
            const status = response?.status;

            if (status === 419) {
                event.preventDefault();
                toast.warning(
                    'Sesi Anda telah berakhir. Memuat ulang halaman…',
                );
                window.setTimeout(() => window.location.reload(), 1500);

                return;
            }

            if (status === 429) {
                event.preventDefault();
                const { retryAfter, message } =
                    extractRetryAfterFromInertiaResponse(response);
                notifyRateLimited(retryAfter, message);
            }
        });

        const stopNavigate = router.on('navigate', () => {
            clearRateLimit();
        });

        return () => {
            stopFlash();
            stopHttpException();
            stopNavigate();
        };
    }, []);
}
