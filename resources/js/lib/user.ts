import type { UserRole } from '@/types';

export const userRoleLabel: Record<UserRole, string> = {
    superadmin: 'Superadmin',
    protokol: 'Tim Protokol',
    pimpinan: 'Pimpinan',
};

export const leaderPositions = [
    'Kajati',
    'Wakajati',
    'Asisten Bidang Pembinaan',
    'Asisten Bidang Intelijen',
    'Asisten Bidang Tindak Pidana Umum',
    'Asisten Bidang Tindak Pidana Khusus',
    'Asisten Bidang Perdata dan Tata Usaha Negara',
    'Asisten Bidang Pidana Militer',
    'Asisten Bidang Pemulihan Aset',
    'Asisten Bidang Pengawasan',
    'Bagian Tata Usaha',
    'Koordinator',
] as const;

/**
 * Label lengkap untuk dropdown jabatan. Kajati/Wakajati ditulis
 * panjang; sisanya sama dengan nilainya.
 */
export const leaderPositionLabel: Record<string, string> = {
    Kajati: 'Kepala Kejaksaan Tinggi',
    Wakajati: 'Wakil Kepala Kejaksaan Tinggi',
};
