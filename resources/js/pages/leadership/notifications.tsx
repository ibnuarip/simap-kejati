import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { BellRing, Clock } from 'lucide-react';
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

export default function LeadershipNotifications() {
    const [timing, setTiming] = useState<string[]>(['24']);

    const toggleTiming = (value: string) => {
        setTiming((current) =>
            current.includes(value)
                ? current.filter((item) => item !== value)
                : [...current, value],
        );
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
                                const checked = timing.includes(option.value);

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
                    <Button
                        onClick={() =>
                            toast.info(
                                'Simpan pengaturan notifikasi akan segera hadir.',
                            )
                        }
                    >
                        Simpan Pengaturan
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
