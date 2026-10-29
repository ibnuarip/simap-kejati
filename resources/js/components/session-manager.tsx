import { useEffect } from 'react';

/**
 * Dijalankan sekali di area login:
 * - Heartbeat tiap 15 menit agar session tidak kedaluwarsa selagi tab
 *   terbuka (lifetime 120 menit).
 * - Penanganan 419 & 429 global ditangani di root (`useFlashToast`)
 *   agar aktif di seluruh halaman termasuk halaman publik/login.
 */
const HEARTBEAT_MS = 15 * 60 * 1000;

export function SessionManager() {
    useEffect(() => {
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
            window.clearInterval(heartbeat);
        };
    }, []);

    return null;
}
