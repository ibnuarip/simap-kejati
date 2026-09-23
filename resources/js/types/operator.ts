import type { AgendaStatus, UserRole } from '@/types';

export type LeaderPosition = 'Kajati' | 'Wakajati' | 'Other';

export type Leader = {
    id: number;
    name: string;
    position: LeaderPosition;
    nip: string | null;
    email: string | null;
    phone: string | null;
    is_active: boolean;
    events_count: number;
};

export type Room = {
    id: number;
    name: string;
    location: string | null;
    capacity: number | null;
    description: string | null;
    is_active: boolean;
    events_count: number;
};

export type Category = {
    id: number;
    name: string;
    color: string | null;
    description: string | null;
    events_count: number;
};

export type ManagedUser = {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    email_verified_at: string | null;
    created_at: string | null;
};

export type ResourceOption = {
    id: number;
    name: string;
};

export type DashboardStats = {
    users: number;
    leaders: number;
    rooms: number;
    categories: number;
    events: number;
    eventsByStatus: Record<AgendaStatus, number>;
};

export type DashboardUpcomingEvent = {
    id: number;
    title: string;
    status: AgendaStatus;
    start_time: string;
    end_time: string;
    leader: string | null;
    room: string | null;
    category: string | null;
};

export type DashboardRecentEvent = {
    id: number;
    title: string;
    status: AgendaStatus;
    created_at: string | null;
    creator: { id: number; name: string } | null;
};

export type SystemInfo = {
    appName: string;
    environment: string;
    laravelVersion: string;
    phpVersion: string;
    debug: boolean;
    database: string;
    sessionDriver: string;
    cacheStore: string;
    queueConnection: string;
};

export type SystemSummary = {
    users: number;
    events: number;
    leaders: number;
    rooms: number;
    categories: number;
};
