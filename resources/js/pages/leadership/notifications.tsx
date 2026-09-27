import { Head, useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { BellRing, Clock, LoaderCircle } from 'lucide-react';
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
                            <Clock className="size-4" />
                            Waktu Pengingat
                        </CardTitle>
                        <CardDescription>
                            Pilih satu atau lebih waktu pengingat sebelum agenda
                            dimulai. Pengingat akan dikirim ke email Anda sesuai
                            pilihan ini.
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
                        Pengaturan akan dikirim sebagai email pengingat sesuai
                        waktu yang dipilih.
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
