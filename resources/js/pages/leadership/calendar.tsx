import { Head } from '@inertiajs/react';
import { AgendaCalendar } from '@/components/agenda-calendar';
import { dashboard as leadershipDashboard } from '@/routes/leadership';
import type { AgendaItem } from '@/types';

type Props = {
    events: AgendaItem[];
};

export default function LeadershipCalendar({ events }: Props) {
    return (
        <>
            <Head title="Kalender Agenda" />

            <div className="flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Kalender Agenda
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Lihat detail kegiatan Anda dengan memilih tanggal pada
                        kalender.
                    </p>
                </div>

                <AgendaCalendar events={events} />
            </div>
        </>
    );
}

LeadershipCalendar.layout = {
    breadcrumbs: [
        { title: 'Beranda', href: leadershipDashboard().url },
        { title: 'Kalender Agenda', href: '/leadership/calendar' },
    ],
};
