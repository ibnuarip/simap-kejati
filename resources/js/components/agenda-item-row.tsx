import { CalendarClock, MapPin, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    agendaStatusLabel,
    agendaStatusVariant,
    formatTime,
} from '@/lib/agenda';
import type { AgendaItem } from '@/types';

type Props = {
    event: AgendaItem;
    showStatus?: boolean;
};

export function AgendaItemRow({ event, showStatus = true }: Props) {
    const time = `${formatTime(event.start_time)} – ${formatTime(event.end_time)}`;

    return (
        <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
                {showStatus && (
                    <Badge variant={agendaStatusVariant[event.status]}>
                        {agendaStatusLabel[event.status]}
                    </Badge>
                )}
                <span className="text-muted-foreground text-xs font-medium">
                    {time}
                </span>
            </div>

            <p className="font-medium">{event.title}</p>

            <p className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm">
                <span className="inline-flex min-w-0 items-center gap-1.5">
                    <User className="size-3.5 shrink-0" />
                    <span className="truncate">
                        {event.leader?.name ?? '-'}
                    </span>
                </span>
                <span className="inline-flex min-w-0 items-center gap-1.5">
                    <MapPin className="size-3.5 shrink-0" />
                    <span className="truncate">
                        {event.room?.name ??
                            event.custom_location ??
                            'Lokasi belum diatur'}
                    </span>
                </span>
                <span className="inline-flex min-w-0 items-center gap-1.5">
                    <CalendarClock className="size-3.5 shrink-0" />
                    <span className="truncate">
                        {event.category?.name ?? 'Tanpa kategori'}
                    </span>
                </span>
            </p>
        </div>
    );
}
