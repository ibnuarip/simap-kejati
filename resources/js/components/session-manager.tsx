import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Dijalankan sekali di area login:
 * - Heartbeat tiap 15 menit agar session tidak kedaluwarsa selagi tab
 *   terbuka (lifetime 120 menit).
 * - Menangani 419 global: toast Bahasa Indonesia lalu muat ulang halaman
 *   agar token CSRF segar (mis. setelah laptop sleep semalaman).
 */
const HEARTBEAT_MS = 15 * 60 * 1000;

export function SessionManager() {
    useEffect(() => {
        const stopListening = router.on('httpException', (event) => {
            const status = (event.detail as { response?: { status?: number } })
                ?.response?.status;

            if (status !== 419) {
                return;
            }

            event.preventDefault();
            toast.warning('Sesi Anda telah berakhir. Memuat ulang halaman…');
            window.setTimeout(() => window.location.reload(), 1500);
        });

        const heartbeat = window.setInterval(() => {
            if (document.visibilityState !== 'visible') {
                return;
            }

            fetch('/session/ping', {
                credentials: 'same-origin',
                headers: { Accept: 'application/json' },
            }).catch(() => {
                // Abaikan: heartbeat berikutnya mencoba lagi. Kegagalan
                // di sini bukan aksi user sehingga tidak perlu toast.
            });
        }, HEARTBEAT_MS);

        return () => {
            stopListening();
            window.clearInterval(heartbeat);
        };
    }, []);

    return null;
}
