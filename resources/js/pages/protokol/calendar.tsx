import { Head } from '@inertiajs/react';
import { AgendaCalendar } from '@/components/agenda-calendar';
import { dashboard as protokolDashboard } from '@/routes/protokol';
import type { AgendaItem } from '@/types';

type Props = {
    events: AgendaItem[];
};

export default function ProtokolCalendar({ events }: Props) {
    return (
        <>
            <Head title="Kalender Agenda" />

            <div className="flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Kalender Agenda
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Tampilan interaktif agenda pimpinan. Pilih tanggal untuk
                        melihat rincian kegiatan.
                    </p>
                </div>

                <AgendaCalendar events={events} />
            </div>
        </>
    );
}

ProtokolCalendar.layout = {
    breadcrumbs: [
        { title: 'Beranda', href: protokolDashboard().url },
        { title: 'Kalender Agenda', href: '/protokol/calendar' },
    ],
};
