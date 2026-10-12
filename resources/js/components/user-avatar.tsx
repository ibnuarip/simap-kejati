import { usePage } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { show as avatarShow } from '@/routes/avatar';

type AvatarUser = {
    id: number;
    name: string;
    avatar?: string | null;
};

/**
 * Foto profil user. Privat: berkas hanya bisa diakses pemilik akun,
 * sehingga gambar hanya dimuat bila baris ini milik user yang login —
 * selebihnya tampil inisial.
 */
export function UserAvatar({
    user,
    className,
}: {
    user: AvatarUser;
    className?: string;
}) {
    const { auth } = usePage().props;
    const getInitials = useInitials();

    const canView = !!user.avatar && auth.user?.id === user.id;

    // "v" berisi nama berkas (UUID baru setiap unggahan) sehingga URL selalu
    // berubah saat foto diganti — browser tidak menyajikan foto lama yang
    // masih tersimpan di cache.
    const src = canView
        ? avatarShow(
              { user: user.id },
              { query: { v: user.avatar ?? undefined } },
          ).url
        : '/images/avatar-default.svg';

    return (
        <Avatar className={className ?? 'h-8 w-8 overflow-hidden rounded-full'}>
            <AvatarImage src={src} alt={user.name} />
            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                {getInitials(user.name)}
            </AvatarFallback>
        </Avatar>
    );
}
