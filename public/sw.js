/* sw.js — Service Worker untuk Web Push Notification SIMAP Kejati.
 *
 * File ini WAJIB ada di root public/ agar scope-nya mencakup seluruh aplikasi.
 * Didaftarkan dari halaman Pengaturan Notifikasi setelah user mengaktifkan toggle.
 * Menerima payload JSON: { title, body, icon, badge, vibrate, data: { url } }.
 */

self.addEventListener('push', (event) => {
    let data = {};

    if (event.data) {
        try {
            data = event.data.json();
        } catch {
            data = { body: event.data.text() };
        }
    }

    const title = data.title ?? 'SIMAP Kejati';
    const url = data.data?.url ?? data.url ?? '/';

    const options = {
        body: data.body ?? '',
        icon: data.icon ?? '/android-chrome-192x192.png',
        badge: data.badge ?? '/android-chrome-192x192.png',
        vibrate: data.vibrate ?? [100, 50, 100],
        data: { url },
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const url = event.notification.data?.url ?? '/';

    event.waitUntil(
        clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                const targetPath = new URL(url, self.location.origin).pathname;

                for (const client of windowClients) {
                    if (
                        new URL(client.url).pathname === targetPath &&
                        'focus' in client
                    ) {
                        return client.focus();
                    }
                }

                if (clients.openWindow) {
                    return clients.openWindow(url);
                }

                return undefined;
            }),
    );
});
