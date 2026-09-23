import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { BellRing, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { dashboard as leadershipDashboard } from '@/routes/leadership';

type Props = {
    recipients: {
        id: number;
        name: string;
        position: string;
        email: string | null;
    }[];
};

const TIMING_OPTIONS = [
    { value: '1', label: '1 Jam Sebelum' },
    { value: '3', label: '3 Jam Sebelum' },
    { value: '24', label: '1 Hari Sebelum (H-1)' },
    { value: '48', label: '2 Hari Sebelum (H-2)' },
];

const positionLabel: Record<string, string> = {
    Kajati: 'Kepala Kejaksaan Tinggi',
    Wakajati: 'Wakil Kepala Kejaksaan Tinggi',
    Other: 'Pejabat Lain',
};

export default function LeadershipNotifications({ recipients }: Props) {
    const [selected, setSelected] = useState<number[]>(() =>
        recipients.map((item) => item.id),
    );
    const [timing, setTiming] = useState('24');

    const toggleRecipient = (id: number) => {
        setSelected((current) =>
            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id],
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
                        Atur email penerima pengingat agenda.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="size-4" />
                            Penerima Pengingat
                        </CardTitle>
                        <CardDescription>
                            Pilih pimpinan yang akan menerima email pengingat
                            agenda.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recipients.length === 0 ? (
                            <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
                                Belum ada data pimpinan yang dapat menjadi
                                penerima.
                            </p>
                        ) : (
                            <div className="divide-border flex flex-col divide-y">
                                {recipients.map((recipient) => (
                                    <label
                                        key={recipient.id}
                                        className="flex cursor-pointer items-start gap-3 py-3"
                                    >
                                        <Checkbox
                                            checked={selected.includes(
                                                recipient.id,
                                            )}
                                            onCheckedChange={() =>
                                                toggleRecipient(recipient.id)
                                            }
                                            className="mt-0.5"
                                        />
                                        <span className="flex flex-col gap-0.5">
                                            <span className="text-sm font-medium">
                                                {recipient.name}
                                            </span>
                                            <span className="text-muted-foreground text-xs">
                                                {positionLabel[
                                                    recipient.position
                                                ] ?? recipient.position}
                                                {recipient.email
                                                    ? ` • ${recipient.email}`
                                                    : ''}
                                            </span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BellRing className="size-4" />
                            Waktu Pengingat
                        </CardTitle>
                        <CardDescription>
                            Kapan pengingat dikirim sebelum agenda dimulai.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {TIMING_OPTIONS.map((option) => (
                            <Button
                                key={option.value}
                                type="button"
                                variant={
                                    timing === option.value
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() => setTiming(option.value)}
                                className={cn(
                                    timing === option.value &&
                                        'text-primary-foreground',
                                )}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </CardContent>
                </Card>

                <div className="flex items-center justify-between gap-4">
                    <p className="text-muted-foreground text-xs">
                        Pengaturan akan tersimpan ke sistem pada tahap
                        implementasi berikutnya.
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
