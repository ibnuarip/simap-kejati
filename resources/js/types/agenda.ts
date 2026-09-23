export type AgendaStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

export type AgendaItem = {
    id: number;
    title: string;
    description: string | null;
    start_time: string | null;
    end_time: string | null;
    dress_code: string | null;
    participants: string | null;
    custom_location: string | null;
    status: AgendaStatus;
    leader: {
        id: number;
        name: string;
        position: string;
    } | null;
    room: {
        id: number;
        name: string;
    } | null;
    category: {
        id: number;
        name: string;
    } | null;
};
