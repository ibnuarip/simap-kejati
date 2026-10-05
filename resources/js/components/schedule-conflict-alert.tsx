import { useEffect, useState } from 'react';
import { AlertTriangle, MapPin } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { formatTime } from '@/lib/agenda';
import type { AgendaItem } from '@/types';

type ConflictResponse = {
    count: number;
    events: AgendaItem[];
};

type Props = {
    checkUrl: string;
    start: string;
    end: string;
    exceptId?: number | null;
};

function formatDate(value: string | null): string {
    if (!value) {
        return '';
    }

    const date = new Date(value.replace(' ', 'T'));

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export function ScheduleConflictAlert({
    checkUrl,
    start,
    end,
    exceptId,
}: Props) {
    const [conflicts, setConflicts] = useState<AgendaItem[] | null>(null);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        if (!start || !end || end <= start) {
            setConflicts(null);
            setTotal(0);

            return;
        }

        const controller = new AbortController();
        const timer = setTimeout(() => {
            const params = new URLSearchParams({ start, end });

            if (exceptId) {
                params.set('except_id', String(exceptId));
            }

            fetch(`${checkUrl}?${params.toString()}`, {
                headers: { Accept: 'application/json' },
                signal: controller.signal,
            })
                .then((response) => (response.ok ? response.json() : null))
                .then((data: ConflictResponse | null) => {
                    if (!data) {
                        return;
                    }

                    setConflicts(data.events);
                    setTotal(data.count);
                })
                .catch(() => {
                    // Abaikan (mis. dibatalkan karena mengetik) — biarkan
                    // hasil terakhir atau validasi server yang berbicara.
                });
        }, 400);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [checkUrl, start, end, exceptId]);

    if (!conflicts || conflicts.length === 0) {
        return null;
    }

    return (
        <div
            role="alert"
            className="min-w-0 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 sm:p-4"
        >
            <p className="flex min-w-0 items-start gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <span className="min-w-0 break-words">
                    Jadwal bentrok dengan {total} agenda lain
                    {conflicts[0]?.start_time
                        ? ` pada ${formatDate(conflicts[0].start_time)}`
                        : ''}
                    .
                </span>
            </p>

            <ul className="mt-3 flex max-h-64 min-w-0 flex-col gap-2 overflow-y-auto pr-0.5 sm:max-h-72">
                {conflicts.map((event) => (
                    <li
                        key={event.id}
                        className="bg-background/60 min-w-0 rounded-lg border px-3 py-2"
                    >
                        <p className="min-w-0 text-sm font-medium break-words">
                            {event.title}
                        </p>
                        <p className="text-muted-foreground mt-1 flex min-w-0 flex-col gap-0.5 text-xs sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3">
                            <span className="shrink-0 font-medium tabular-nums">
                                {formatTime(event.start_time)} –{' '}
                                {formatTime(event.end_time)}
                            </span>
                            <span className="inline-flex min-w-0 items-center gap-1">
                                <MapPin className="size-3 shrink-0" />
                                <span className="truncate">
                                    {event.room?.name ??
                                        event.custom_location ??
                                        'Lokasi belum diatur'}
                                </span>
                            </span>
                        </p>
                    </li>
                ))}
            </ul>

            {total > conflicts.length && (
                <p className="text-muted-foreground mt-2 text-xs">
                    …dan {total - conflicts.length} agenda bentrok lainnya.
                </p>
            )}

            <label className="mt-3 flex min-w-0 cursor-pointer items-start gap-2.5 text-sm">
                <Checkbox
                    name="force_save"
                    value="1"
                    className="mt-0.5 shrink-0"
                />
                <span className="min-w-0">
                    Saya memahami bentrok ini.{' '}
                    <span className="font-semibold">Tetap simpan</span> agenda.
                </span>
            </label>
        </div>
    );
}
