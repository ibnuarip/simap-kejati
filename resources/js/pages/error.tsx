import { Head } from '@inertiajs/react';
import {
    Building2,
    FileQuestion,
    ServerCrash,
    ShieldAlert,
    Wrench,
    type LucideIcon,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';

type Props = {
    status: number;
};

type ErrorConfig = {
    title: string;
    description: string;
    hint: string;
    icon: LucideIcon;
};

const ERROR_CONTENT: Record<number, ErrorConfig> = {
    403: {
        title: 'Akses Tidak Diizinkan',
        description:
            'Maaf, akun Anda tidak memiliki hak akses atau wewenang untuk membuka halaman ini.',
        hint: 'Pastikan Anda masuk menggunakan akun dengan peran yang sesuai.',
        icon: ShieldAlert,
    },
    404: {
        title: 'Halaman Tidak Ditemukan',
        description:
            'Alamat URL yang Anda akses tidak tersedia, telah dipindahkan, atau terdapat kesalahan penulisan tautan.',
        hint: 'Periksa kembali penulisan alamat URL pada bilah peramban Anda.',
        icon: FileQuestion,
    },
    500: {
        title: 'Terjadi Gangguan pada Server',
        description:
            'Sistem mengalami kendala internal saat memproses permintaan Anda.',
        hint: 'Silakan muat ulang halaman beberapa saat lagi atau hubungi administrator SIMAP.',
        icon: ServerCrash,
    },
    503: {
        title: 'Layanan Sedang Pemeliharaan',
        description:
            'Sistem SIMAP sedang dalam pemeliharaan terjadwal guna meningkatkan kualitas layanan.',
        hint: 'Silakan akses kembali sistem beberapa saat lagi.',
        icon: Wrench,
    },
};

const DEFAULT_ERROR: ErrorConfig = {
    title: 'Permintaan Tidak Dapat Diproses',
    description: 'Terjadi kendala saat membuka halaman yang Anda minta.',
    hint: 'Silakan periksa kembali alamat URL atau coba beberapa saat lagi.',
    icon: ServerCrash,
};

export default function ErrorPage({ status }: Props) {
    const config = ERROR_CONTENT[status] ?? DEFAULT_ERROR;
    const Icon = config.icon;

    return (
        <>
            <Head title={`${status} - ${config.title}`} />

            <div className="bg-background relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-12 select-none">
                {/* Dekorasi cahaya latar bernuansa Hijau Kejaksaan & Emas */}
                <div
                    aria-hidden
                    className="bg-primary/15 pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl"
                />
                <div
                    aria-hidden
                    className="bg-secondary/15 pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 -translate-x-1/2 rounded-full blur-3xl"
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--background)_75%)]"
                />

                <div className="relative z-10 flex w-full max-w-lg flex-col items-center">
                    {/* Identitas Instansi */}
                    <div className="border-border/80 bg-card/80 mb-6 inline-flex items-center gap-3 rounded-full border px-4 py-2 shadow-xs backdrop-blur-md">
                        <AppLogoIcon className="size-7 shrink-0" />
                        <div className="bg-border h-4 w-px" />
                        <span className="text-foreground inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
                            <Building2 className="text-primary size-3.5 shrink-0" />
                            Kejaksaan Tinggi Jawa Barat
                        </span>
                    </div>

                    {/* Kartu Utama */}
                    <div className="border-border/80 bg-card/90 relative w-full overflow-hidden rounded-3xl border p-8 text-center shadow-xl backdrop-blur-md sm:p-10">
                        {/* Garis Aksen Hijau & Emas di bagian atas kartu */}
                        <div
                            aria-hidden
                            className="from-primary via-secondary to-primary absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r"
                        />

                        {/* Ikon Berlapis */}
                        <div className="relative mx-auto mb-6 flex size-20 items-center justify-center">
                            <div
                                aria-hidden
                                className="bg-primary/15 absolute inset-0 animate-pulse rounded-3xl blur-md"
                            />
                            <div className="border-primary/20 bg-primary/10 text-primary relative flex size-20 items-center justify-center rounded-2xl border shadow-inner">
                                <Icon className="size-10 stroke-[1.75]" />
                            </div>
                        </div>

                        {/* Angka Status & Judul */}
                        <p
                            data-test="error-status"
                            className="from-primary via-primary to-secondary bg-gradient-to-br bg-clip-text text-6xl font-black tracking-tight text-transparent sm:text-7xl"
                        >
                            {status}
                        </p>

                        <h1
                            data-test="error-title"
                            className="text-foreground mt-3 text-xl font-bold tracking-tight sm:text-2xl"
                        >
                            {config.title}
                        </h1>

                        <p className="text-muted-foreground mx-auto mt-3 max-w-md text-sm leading-relaxed">
                            {config.description}
                        </p>

                        {/* Kotak Petunjuk */}
                        <div className="border-border/70 bg-muted/50 text-muted-foreground mt-6 rounded-xl border px-4 py-3 text-xs">
                            {config.hint}
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-muted-foreground/70 mt-6 text-center text-xs font-medium tracking-wide">
                        SIMAP — Sistem Informasi Manajemen Agenda Pimpinan
                    </p>
                </div>
            </div>
        </>
    );
}
