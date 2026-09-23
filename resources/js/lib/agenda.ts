import type { AgendaItem, AgendaStatus } from '@/types';

export const agendaStatusVariant: Record<
    AgendaStatus,
    'scheduled' | 'ongoing' | 'completed' | 'cancelled'
> = {
    scheduled: 'scheduled',
    ongoing: 'ongoing',
    completed: 'completed',
    cancelled: 'cancelled',
};

export const agendaStatusLabel: Record<AgendaStatus, string> = {
    scheduled: 'Dijadwalkan',
    ongoing: 'Berlangsung',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
};

export function toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function eventDateKey(event: AgendaItem): string {
    return (event.start_time ?? '').slice(0, 10);
}

export function eventsOnDate(events: AgendaItem[], key: string): AgendaItem[] {
    return events.filter((event) => eventDateKey(event) === key);
}

export function formatTime(dateTime: string | null): string {
    if (!dateTime) {
        return '';
    }

    const parts = dateTime.split(' ');

    return parts.length > 1 ? parts[1].slice(0, 5) : '';
}

export function formatDateLong(dateKey: string): string {
    return new Date(`${dateKey}T00:00:00`).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}
