import { useCallback, useEffect, useState } from 'react';

const DEFAULT_BASE_PATH = '/leadership/push';

function pushUrl(basePath: string, action: string): string {
    return `${basePath}/${action}`;
}

type ServerSubscription = {
    endpoint: string;
};

function getXsrfToken(): string | null {
    const match = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='));

    return match ? decodeURIComponent(match.split('=')[1]) : null;
}

async function api<T>(url: string, body?: unknown): Promise<T> {
    const response = await fetch(url, {
        method: body === undefined ? 'GET' : 'POST',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(getXsrfToken()
                ? { 'X-XSRF-TOKEN': getXsrfToken() as string }
                : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
            (data as { message?: string } | null)?.message ??
                `Request gagal (${response.status}).`,
        );
    }

    return response.json() as Promise<T>;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

function hasSameApplicationServerKey(
    subscription: PushSubscription,
    expectedKey: Uint8Array,
): boolean {
    const currentBuffer = subscription.options?.applicationServerKey;

    if (!currentBuffer) {
        return true;
    }

    const currentKey = new Uint8Array(currentBuffer);

    if (currentKey.byteLength !== expectedKey.byteLength) {
        return false;
    }

    for (let i = 0; i < currentKey.byteLength; i++) {
        if (currentKey[i] !== expectedKey[i]) {
            return false;
        }
    }

    return true;
}

async function detectBraveBrowser(): Promise<boolean> {
    if (typeof navigator === 'undefined') {
        return false;
    }

    const nav = navigator as Navigator & {
        brave?: { isBrave?: () => Promise<boolean> };
    };

    if (typeof nav.brave?.isBrave === 'function') {
        try {
            return await nav.brave.isBrave();
        } catch {
            return false;
        }
    }

    return false;
}

function toFriendlyError(error: unknown, isBrave: boolean): string {
    if (error instanceof Error) {
        if (/push service/i.test(error.message)) {
            if (isBrave) {
                return 'Aktifkan "Google services for push messaging" di brave://settings/privacy lalu muat ulang browser.';
            }

            return 'Gagal mendaftar ke layanan push. Periksa koneksi internet atau pengaturan privasi browser.';
        }

        if (
            /script|service worker|active service worker/i.test(error.message)
        ) {
            return 'Gagal menyiapkan Service Worker notifikasi. Muat ulang halaman lalu coba lagi.';
        }

        return error.message;
    }

    return 'Gagal mengaktifkan notifikasi.';
}

export type PushStatus = {
    subscribed: boolean;
    permission: NotificationPermission | 'unsupported';
};

export function usePushNotifications(basePath: string = DEFAULT_BASE_PATH) {
    const subscribeUrl = pushUrl(basePath, 'subscribe');
    const unsubscribeUrl = pushUrl(basePath, 'unsubscribe');
    const statusUrl = pushUrl(basePath, 'status');
    const vapidKeyUrl = pushUrl(basePath, 'vapid-key');
    // Default: MATI. Hanya true setelah browser DAN server sama-sama
    // mengonfirmasi ada subscription yang cocok. Tidak ada auto-subscribe.
    const [status, setStatus] = useState<PushStatus>({
        subscribed: false,
        permission:
            typeof Notification === 'undefined'
                ? 'unsupported'
                : Notification.permission,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [isBrave, setIsBrave] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const isSupported =
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        typeof Notification !== 'undefined';

    useEffect(() => {
        void detectBraveBrowser().then(setIsBrave);
    }, []);

    const refreshStatus = useCallback(async () => {
        if (!isSupported) {
            setIsChecking(false);

            return;
        }

        try {
            const registration =
                (await navigator.serviceWorker.getRegistration('/')) ??
                (await navigator.serviceWorker.getRegistration());

            const browserSubscription =
                (await registration?.pushManager.getSubscription()) ?? null;

            if (!browserSubscription) {
                setStatus({
                    subscribed: false,
                    permission: Notification.permission,
                });

                return;
            }

            // Cek silang ke server: subscription dianggap aktif untuk user ini
            // hanya jika endpoint-nya juga tercatat milik user ini di database.
            let serverKnown = false;
            let serverEndpoints: string[] = [];

            try {
                const data = await api<{ subscriptions: ServerSubscription[] }>(
                    statusUrl,
                );
                serverEndpoints = data.subscriptions.map((s) => s.endpoint);
                serverKnown = true;
            } catch {
                // Server tidak bisa dihubungi — jangan ubah status aktif,
                // dan JANGAN bersih-bersih agar tidak menghapus data valid.
            }

            if (!serverKnown) {
                setStatus((prev) => ({
                    ...prev,
                    permission: Notification.permission,
                }));

                return;
            }

            // Jangan auto-transfer dan jangan auto-unsubscribe saat membuka halaman:
            // jika endpoint di browser milik akun lain di perangkat yang sama,
            // biarkan akun pemilik sebelumnya tetap aktif sampai user saat ini
            // secara eksplisit menekan tombol "Aktifkan Notifikasi".
            setStatus({
                subscribed: serverEndpoints.includes(
                    browserSubscription.endpoint,
                ),
                permission: Notification.permission,
            });
        } catch {
            // Abaikan — status default (mati) sudah cukup.
        } finally {
            setIsChecking(false);
        }
    }, [isSupported, statusUrl]);

    useEffect(() => {
        void refreshStatus();
    }, [refreshStatus]);

    const enable = useCallback(async () => {
        if (!isSupported) {
            setErrorMessage('Browser ini tidak mendukung push notification.');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            const permission = await Notification.requestPermission();

            setStatus((prev) => ({ ...prev, permission }));

            if (permission !== 'granted') {
                throw new Error(
                    'Izin notifikasi ditolak. Aktifkan lewat pengaturan browser.',
                );
            }

            await navigator.serviceWorker.register('/sw.js', { scope: '/' });

            const readyRegistration = await navigator.serviceWorker.ready;

            const { publicKey } = await api<{ publicKey: string }>(vapidKeyUrl);
            const applicationServerKey = urlBase64ToUint8Array(publicKey);

            let subscription =
                await readyRegistration.pushManager.getSubscription();

            if (
                subscription &&
                !hasSameApplicationServerKey(subscription, applicationServerKey)
            ) {
                await subscription.unsubscribe().catch(() => false);
                subscription = null;
            }

            if (!subscription) {
                subscription = await readyRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey,
                });
            }

            const subscriptionJson = subscription.toJSON();

            await api(subscribeUrl, {
                endpoint: subscription.endpoint,
                public_key: subscriptionJson.keys?.p256dh,
                auth_secret: subscriptionJson.keys?.auth,
                name: navigator.userAgent.includes('Mobile')
                    ? 'Perangkat Mobile'
                    : 'Perangkat Desktop',
                user_agent: navigator.userAgent.slice(0, 255),
            });

            setStatus((prev) => ({ ...prev, subscribed: true }));
        } catch (error) {
            // Simpan error mentah di console untuk diagnosis (F12 → Console).
            console.error('[push] enable failed:', error);
            const braveDetected = isBrave || (await detectBraveBrowser());
            setErrorMessage(toFriendlyError(error, braveDetected));
        } finally {
            setIsLoading(false);
        }
    }, [isSupported, isBrave, vapidKeyUrl, subscribeUrl]);

    const disable = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const registration =
                (await navigator.serviceWorker.getRegistration('/')) ??
                (await navigator.serviceWorker.getRegistration());

            const subscription =
                await registration?.pushManager.getSubscription();

            if (subscription) {
                await api(unsubscribeUrl, {
                    endpoint: subscription.endpoint,
                });
                await subscription.unsubscribe().catch(() => false);
            }

            setStatus((prev) => ({ ...prev, subscribed: false }));
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : 'Gagal menonaktifkan notifikasi.',
            );
        } finally {
            setIsLoading(false);
        }
    }, [unsubscribeUrl]);

    return {
        isSupported,
        isBrave,
        subscribed: status.subscribed,
        permission: status.permission,
        isLoading,
        isChecking,
        errorMessage,
        enable,
        disable,
        refreshStatus,
    };
}
