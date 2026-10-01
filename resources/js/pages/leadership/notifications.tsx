import { Head, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Bell, BellOff, BellRing, Clock, LoaderCircle } from 'lucide-react';
import NotificationController from '@/actions/App/Http/Controllers/Leadership/NotificationController';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { dashboard as leadershipDashboard } from '@/routes/leadership';

const TIMING_OPTIONS = [
    { value: '1', label: '1 Jam Sebelum' },
    { value: '3', label: '3 Jam Sebelum' },
    { value: '24', label: '1 Hari Sebelum (H-1)' },
    { value: '48', label: '2 Hari Sebelum (H-2)' },
];

type Props = {
    reminderTimings: string[];
};

export default function LeadershipNotifications({ reminderTimings }: Props) {
    const { data, setData, post, processing } = useForm({
        timings: reminderTimings.length > 0 ? reminderTimings : ['24'],
    });

    const push = usePushNotifications();

    useEffect(() => {
        if (push.errorMessage) {
            toast.error(push.errorMessage);
        }
    }, [push.errorMessage]);

    const toggleTiming = (value: string) => {
        const current = data.timings;

        setData(
            'timings',
            current.includes(value)
                ? current.filter((item) => item !== value)
                : [...current, value],
        );
    };

    const handleSubmit = () => {
        post(NotificationController.update.url(), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Pengaturan notifikasi berhasil disimpan.');
            },
            onError: (errors) => {
                const message = Object.values(errors)[0];

                toast.error(
                    message ? String(message) : 'Gagal menyimpan pengaturan.',
                );
            },
        });
    };

    return (
        <>
            <Head title="Pengaturan Notifikasi" />

            <div className="flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Pengaturan Notifikasi
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Atur jadwal pengingat otomatis agenda Anda.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BellRing className="size-4" />
                            Notifikasi Push Perangkat Ini
                        </CardTitle>
                        <CardDescription>
                            Aktifkan agar pengingat agenda muncul langsung di
                            layar perangkat ini, sesuai waktu pengingat yang
                            Anda pilih di bawah.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!push.isSupported ? (
                            <p className="text-muted-foreground text-sm">
                                Browser ini tidak mendukung push notification.
                                Gunakan Chrome, Edge, Firefox, atau Safari
                                versi terbaru.
                            </p>
                        ) : (
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <p className="flex items-center gap-2 text-sm">
                                    {push.subscribed ? (
                                        <>
                                            <Bell className="size-4 text-green-600" />
                                            <span className="font-medium">
                                                Notifikasi aktif di perangkat
                                                ini.
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <BellOff className="text-muted-foreground size-4" />
                                            <span className="text-muted-foreground">
                                                {push.permission === 'denied'
                                                    ? 'Izin notifikasi diblokir browser. Aktifkan lewat pengaturan situs browser.'
                                                    : 'Notifikasi belum aktif di perangkat ini.'}
                                            </span>
                                        </>
                                    )}
                                </p>
                                <Button
                                    variant={
                                        push.subscribed
                                            ? 'outline'
                                            : 'default'
                                    }
                                    onClick={() =>
                                        push.subscribed
                                            ? push.disable()
                                            : push.enable()
                                    }
                                    disabled={push.isLoading}
                                >
                                    {push.isLoading ? (
                                        <LoaderCircle className="animate-spin" />
                                    ) : null}
                                    {push.subscribed
                                        ? 'Nonaktifkan'
                                        : 'Aktifkan Notifikasi'}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="size-4" />
                            Waktu Pengingat
                        </CardTitle>
                        <CardDescription>
                            Pilih satu atau lebih waktu pengingat sebelum agenda
                            dimulai. Pengingat akan muncul langsung di perangkat
                            Anda sesuai pilihan ini.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-border flex flex-col divide-y">
                            {TIMING_OPTIONS.map((option) => {
                                const checked = data.timings.includes(
                                    option.value,
                                );

                                return (
                                    <label
                                        key={option.value}
                                        className="flex cursor-pointer items-center gap-3 py-3"
                                    >
                                        <Checkbox
                                            checked={checked}
                                            onCheckedChange={() =>
                                                toggleTiming(option.value)
                                            }
                                        />
                                        <span
                                            className={`text-sm ${
                                                checked
                                                    ? 'font-medium'
                                                    : 'text-muted-foreground'
                                            }`}
                                        >
                                            {option.label}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center justify-between gap-4">
                    <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                        <BellRing className="size-3.5 shrink-0" />
                        Pengaturan akan dikirim sebagai notifikasi push ke
                        perangkat Anda sesuai waktu yang dipilih.
                    </p>
                    <Button onClick={handleSubmit} disabled={processing}>
                        {processing ? (
                            <LoaderCircle className="animate-spin" />
                        ) : null}
                        {processing ? 'Menyimpan…' : 'Simpan Pengaturan'}
                    </Button>
                </div>
            </div>
        </>
    );
}

LeadershipNotifications.layout = {
    breadcrumbs: [
        { title: 'Beranda', href: leadershipDashboard().url },
        { title: 'Pengaturan Notifikasi', href: '/leadership/notifications' },
    ],
};
