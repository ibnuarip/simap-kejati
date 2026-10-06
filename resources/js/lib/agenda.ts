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

function parseDatetimeLocal(value: string): Date | null {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
}

function toDatetimeLocalInput(date: Date): string {
    const pad = (part: number) => String(part).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Tambah menit ke nilai datetime-local ("YYYY-MM-DDTHH:mm").
 * Mengembalikan string kosong bila input tidak valid.
 */
export function addMinutesToInput(value: string, minutes: number): string {
    const date = parseDatetimeLocal(value);

    if (!date) {
        return '';
    }

    date.setMinutes(date.getMinutes() + minutes);

    return toDatetimeLocalInput(date);
}

/**
 * Label durasi Indonesia ("45 menit", "2 jam", "1 jam 30 menit").
 * Null bila rentang tidak valid.
 */
export function durationLabel(start: string, end: string): string | null {
    const startDate = parseDatetimeLocal(start);
    const endDate = parseDatetimeLocal(end);

    if (!startDate || !endDate) {
        return null;
    }

    const minutes = Math.round(
        (endDate.getTime() - startDate.getTime()) / 60000,
    );

    if (minutes <= 0) {
        return null;
    }

    if (minutes < 60) {
        return `${minutes} menit`;
    }

    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    return rest > 0 ? `${hours} jam ${rest} menit` : `${hours} jam`;
}
