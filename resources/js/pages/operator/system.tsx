import { Head } from '@inertiajs/react';
import {
    Building2,
    CalendarCheck,
    CheckCircle2,
    Database,
    Server,
    Tags,
    UserCheck,
    Users,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dashboard } from '@/routes';
import { system as systemSettings } from '@/routes/settings';
import type { SystemInfo, SystemSummary } from '@/types';

type Props = {
    info: SystemInfo;
    summary: SystemSummary;
};

const INFO_ROWS: { key: keyof SystemInfo; label: string }[] = [
    { key: 'appName', label: 'Nama Aplikasi' },
    { key: 'environment', label: 'Lingkungan' },
    { key: 'laravelVersion', label: 'Versi Laravel' },
    { key: 'phpVersion', label: 'Versi PHP' },
    { key: 'database', label: 'Database' },
    { key: 'sessionDriver', label: 'Driver Sesi' },
    { key: 'cacheStore', label: 'Penyimpanan Cache' },
    { key: 'queueConnection', label: 'Antrean (Queue)' },
];

export default function OperatorSystem({ info, summary }: Props) {
    return (
        <>
            <Head title="Pengaturan Sistem" />

            <div className="flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Pengaturan Sistem
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Informasi teknis sistem dan ringkasan data aplikasi.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Server className="size-4" />
                                Informasi Sistem
                            </CardTitle>
                            <CardDescription>
                                Detail lingkungan tempat aplikasi berjalan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid gap-4">
                                {INFO_ROWS.map((row) => (
                                    <div
                                        key={row.key}
                                        className="flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"
                                    >
                                        <dt className="text-muted-foreground text-sm">
                                            {row.label}
                                        </dt>
                                        <dd className="text-sm font-medium">
                                            {typeof info[row.key] === 'boolean'
                                                ? info[row.key] === true
                                                    ? 'Aktif'
                                                    : 'Nonaktif'
                                                : String(info[row.key])}
                                        </dd>
                                    </div>
                                ))}
                            </dl>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <span className="text-muted-foreground text-sm">
                                    Mode Debug:
                                </span>
                                {info.debug ? (
                                    <Badge variant="secondary">
                                        Aktif — jangan digunakan di produksi
                                    </Badge>
                                ) : (
                                    <Badge variant="outline">Nonaktif</Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="size-4" />
                                Ringkasan Data
                            </CardTitle>
                            <CardDescription>
                                Jumlah data yang tersimpan saat ini.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <SummaryRow
                                icon={Users}
                                label="Pengguna"
                                value={summary.users}
                            />
                            <SummaryRow
                                icon={CalendarCheck}
                                label="Agenda"
                                value={summary.events}
                            />
                            <SummaryRow
                                icon={UserCheck}
                                label="Pimpinan"
                                value={summary.leaders}
                            />
                            <SummaryRow
                                icon={Building2}
                                label="Ruangan"
                                value={summary.rooms}
                            />
                            <SummaryRow
                                icon={Tags}
                                label="Kategori"
                                value={summary.categories}
                            />
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="flex items-start gap-3 pt-6">
                        <CheckCircle2 className="text-muted-foreground mt-0.5 size-5 shrink-0" />
                        <p className="text-muted-foreground text-sm">
                            Halaman ini menampilkan informasi statis dari
                            konfigurasi sistem. Pengaturan lanjutan seperti
                            kredensial email, integrasi, dan notifikasi akan
                            dikelola pada tahap berikutnya melalui menu yang
                            relevan.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function SummaryRow({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Users;
    label: string;
    value: number;
}) {
    return (
        <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
                <Icon className="text-muted-foreground size-4" />
                <span className="text-sm">{label}</span>
            </div>
            <span className="text-lg font-semibold tabular-nums">{value}</span>
        </div>
    );
}

OperatorSystem.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Pengaturan Sistem', href: systemSettings().url },
    ],
};
