import type { LeaderPosition, UserRole } from '@/types';

export const userRoleLabel: Record<UserRole, string> = {
    operator: 'Operator',
    protokol: 'Tim Protokol',
    kajati: 'Kajati',
    wakajati: 'Wakajati',
};

export const leaderPositionLabel: Record<LeaderPosition, string> = {
    Kajati: 'Kajati',
    Wakajati: 'Wakajati',
    Other: 'Lainnya',
};
