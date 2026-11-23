import {
    CalendarClock,
    ExternalLink,
    FileText,
    MapPin,
    User,
} from 'lucide-react';
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
        <div className="flex min-w-0 flex-col gap-1">
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

            <p className="font-medium break-words">{event.title}</p>

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

            {event.attachment_url && (
                <a
                    href={event.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary mt-0.5 inline-flex w-fit max-w-full min-w-0 items-center gap-1.5 text-xs font-medium hover:underline"
                >
                    <FileText className="size-3.5 shrink-0" />
                    <span className="truncate">
                        {event.attachment_name ?? 'Lihat Lampiran PDF'}
                    </span>
                    <ExternalLink className="size-3 shrink-0" />
                </a>
            )}
        </div>
    );
}
