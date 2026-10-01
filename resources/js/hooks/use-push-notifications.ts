import { useCallback, useEffect, useState } from 'react';

const SUBSCRIBE_URL = '/leadership/push/subscribe';
const UNSUBSCRIBE_URL = '/leadership/push/unsubscribe';
const STATUS_URL = '/leadership/push/status';
const VAPID_KEY_URL = '/leadership/push/vapid-key';

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

function toFriendlyError(error: unknown): string {
    if (error instanceof Error) {
        if (/push service/i.test(error.message)) {
            return 'Gagal mendaftar ke layanan push. Periksa koneksi internet, lalu coba lagi.';
        }

        return error.message;
    }

    return 'Gagal mengaktifkan notifikasi.';
}

export type PushStatus = {
    subscribed: boolean;
    permission: NotificationPermission | 'unsupported';
};

export function usePushNotifications() {
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
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const isSupported =
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        typeof Notification !== 'undefined';

    const refreshStatus = useCallback(async () => {
        if (!isSupported) {
            return;
        }

        try {
            const registration =
                await navigator.serviceWorker.getRegistration();

            const browserSubscription =
                (await registration?.pushManager.getSubscription()) ?? null;

            if (!browserSubscription) {
                setStatus({
                    subscribed: false,
                    permission: Notification.permission,
                });

                return;
            }

            // Cek silang ke server: subscription dianggap aktif hanya jika
            // endpoint-nya juga tercatat di database.
            let serverKnown = false;
            let serverEndpoints: string[] = [];

            try {
                const data = await api<{ subscriptions: ServerSubscription[] }>(
                    STATUS_URL,
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

            if (!serverEndpoints.includes(browserSubscription.endpoint)) {
                // Sisa subscription basi di browser (mis. gagal simpan ke
                // server sebelumnya) — bersihkan agar tampil MATI.
                await browserSubscription.unsubscribe().catch(() => false);
                setStatus({
                    subscribed: false,
                    permission: Notification.permission,
                });

                return;
            }

            setStatus({
                subscribed: true,
                permission: Notification.permission,
            });
        } catch {
            // Abaikan — status default (mati) sudah cukup.
        }
    }, [isSupported]);

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

            const registration = await navigator.serviceWorker.register(
                '/sw.js',
                { scope: '/' },
            );

            await navigator.serviceWorker.ready;

            const { publicKey } = await api<{ publicKey: string }>(
                VAPID_KEY_URL,
            );

            // Hapus subscription lama/basi dulu agar subscribe selalu fresh
            // (mencegah "Registration failed - push service error").
            const stale = await registration.pushManager.getSubscription();

            if (stale) {
                await stale.unsubscribe().catch(() => false);
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey),
            });

            const subscriptionJson = subscription.toJSON();

            try {
                await api(SUBSCRIBE_URL, {
                    endpoint: subscription.endpoint,
                    public_key: subscriptionJson.keys?.p256dh,
                    auth_secret: subscriptionJson.keys?.auth,
                    name: navigator.userAgent.includes('Mobile')
                        ? 'Perangkat Mobile'
                        : 'Perangkat Desktop',
                    user_agent: navigator.userAgent.slice(0, 255),
                });
            } catch (error) {
                // Rollback: jangan sisakan subscription yatim di browser.
                await subscription.unsubscribe().catch(() => false);
                throw error;
            }

            setStatus((prev) => ({ ...prev, subscribed: true }));
        } catch (error) {
            // Simpan error mentah di console untuk diagnosis (F12 → Console).
            console.error('[push] enable failed:', error);
            setErrorMessage(toFriendlyError(error));
        } finally {
            setIsLoading(false);
        }
    }, [isSupported]);

    const disable = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const registration =
                await navigator.serviceWorker.getRegistration();

            const subscription =
                await registration?.pushManager.getSubscription();

            if (subscription) {
                await api(UNSUBSCRIBE_URL, {
                    endpoint: subscription.endpoint,
                });
                await subscription.unsubscribe();
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
    }, []);

    return {
        isSupported,
        subscribed: status.subscribed,
        permission: status.permission,
        isLoading,
        errorMessage,
        enable,
        disable,
        refreshStatus,
    };
}
