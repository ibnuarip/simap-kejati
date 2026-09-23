import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    agendaStatusLabel,
    agendaStatusVariant,
    eventsOnDate,
    formatDateLong,
    formatTime,
    toDateKey,
} from '@/lib/agenda';
import type { AgendaItem, AgendaStatus } from '@/types';

const MONTH_NAMES = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

const DAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export function AgendaCalendar({ events }: { events: AgendaItem[] }) {
    const [currentMonth, setCurrentMonth] = useState(() => {
        const today = new Date();

        return new Date(today.getFullYear(), today.getMonth(), 1);
    });
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();

        return toDateKey(today);
    });

    const days = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
        const previousMonthDays = new Date(year, month, 0).getDate();

        return Array.from({ length: totalCells }, (_, index) => {
            const dayOffset = index - firstWeekday + 1;
            const outOfMonth = dayOffset < 1 || dayOffset > daysInMonth;

            if (outOfMonth) {
                const year2 =
                    dayOffset < 1
                        ? month === 0
                            ? year - 1
                            : year
                        : month === 11
                          ? year + 1
                          : year;
                const month2 =
                    dayOffset < 1
                        ? month === 0
                            ? 11
                            : month - 1
                        : month === 11
                          ? 0
                          : month + 1;
                const day =
                    dayOffset < 1
                        ? previousMonthDays + dayOffset
                        : dayOffset - daysInMonth;

                return {
                    key: toDateKey(new Date(year2, month2, day)),
                    day,
                    isCurrentMonth: false,
                };
            }

            return {
                key: toDateKey(new Date(year, month, dayOffset)),
                day: dayOffset,
                isCurrentMonth: true,
            };
        });
    }, [currentMonth]);

    const selectedEvents = useMemo(
        () => eventsOnDate(events, selectedDate),
        [events, selectedDate],
    );

    const todayKey = useMemo(() => toDateKey(new Date()), []);

    const monthLabel = `${MONTH_NAMES[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

    const changeMonth = (delta: number) => {
        setCurrentMonth(
            new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() + delta,
                1,
            ),
        );
    };

    const goToToday = () => {
        const now = new Date();

        setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
        setSelectedDate(toDateKey(now));
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold tracking-tight">
                    {monthLabel}
                </h2>
                <div className="flex items-center gap-1.5">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => changeMonth(-1)}
                        aria-label="Bulan sebelumnya"
                        className="size-9"
                    >
                        <ChevronLeft aria-hidden />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToToday}
                        className="h-9 px-3"
                    >
                        Hari Ini
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => changeMonth(1)}
                        aria-label="Bulan berikutnya"
                        className="size-9"
                    >
                        <ChevronRight aria-hidden />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {DAY_NAMES.map((day) => (
                    <div
                        key={day}
                        className="text-muted-foreground py-2 text-center text-xs font-medium tracking-wide uppercase"
                    >
                        {day}
                    </div>
                ))}

                {days.map(({ key, day, isCurrentMonth }) => {
                    const dayEvents = eventsOnDate(events, key);
                    const isToday = key === todayKey;
                    const isSelected = key === selectedDate;

                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setSelectedDate(key)}
                            className={cn(
                                'flex min-h-20 flex-col gap-1 rounded-lg border p-1.5 text-left transition-colors',
                                isCurrentMonth
                                    ? 'bg-card'
                                    : 'bg-muted/40 text-muted-foreground',
                                isSelected &&
                                    'border-primary ring-primary/30 ring-2',
                                !isSelected &&
                                    isCurrentMonth &&
                                    'hover:border-border',
                            )}
                        >
                            <span
                                className={cn(
                                    'flex size-6 items-center justify-center rounded-full text-xs font-medium',
                                    isToday &&
                                        'bg-primary text-primary-foreground',
                                )}
                            >
                                {day}
                            </span>

                            {dayEvents.length > 0 && (
                                <span className="mt-auto flex flex-wrap gap-1">
                                    {dayEvents.slice(0, 2).map((event) => (
                                        <span
                                            key={event.id}
                                            className="bg-primary block h-1.5 w-4 rounded-full"
                                            aria-label={event.title}
                                        />
                                    ))}
                                    {dayEvents.length > 2 && (
                                        <span className="text-muted-foreground text-[10px]">
                                            +{dayEvents.length - 2}
                                        </span>
                                    )}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-4">
                <span className="text-foreground text-xs font-semibold tracking-wide uppercase">
                    Status:
                </span>
                {Object.entries(agendaStatusLabel).map(([status, label]) => (
                    <span
                        key={status}
                        className="inline-flex items-center gap-1.5"
                    >
                        <Badge
                            variant={
                                agendaStatusVariant[status as AgendaStatus]
                            }
                            className="px-2 py-0.5"
                        >
                            {label}
                        </Badge>
                    </span>
                ))}
            </div>

            <div className="flex flex-col gap-3">
                <h3 className="font-semibold">
                    Rincian Kegiatan{' '}
                    <span className="text-muted-foreground font-normal">
                        {formatDateLong(selectedDate)}
                    </span>
                </h3>

                {selectedEvents.length === 0 ? (
                    <p className="text-muted-foreground rounded-lg border border-dashed py-6 text-center text-sm">
                        Tidak ada agenda pada tanggal ini.
                    </p>
                ) : (
                    <div className="divide-border flex flex-col divide-y rounded-lg border">
                        {selectedEvents.map((event) => (
                            <div
                                key={event.id}
                                className="flex flex-col gap-1 p-4"
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge
                                        variant={
                                            agendaStatusVariant[event.status]
                                        }
                                    >
                                        {agendaStatusLabel[event.status]}
                                    </Badge>
                                    <span className="text-muted-foreground text-xs font-medium">
                                        {formatTime(event.start_time)} –{' '}
                                        {formatTime(event.end_time)}
                                    </span>
                                </div>
                                <p className="font-medium">{event.title}</p>
                                <p className="text-muted-foreground text-sm">
                                    {event.leader?.name ?? '-'} •{' '}
                                    {event.room?.name ??
                                        event.custom_location ??
                                        'Lokasi belum diatur'}{' '}
                                    • {event.category?.name ?? 'Tanpa kategori'}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
