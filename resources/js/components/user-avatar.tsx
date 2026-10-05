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

    return (
        <Avatar className={className ?? 'h-8 w-8 overflow-hidden rounded-full'}>
            <AvatarImage
                src={
                    canView
                        ? avatarShow({ user: user.id }).url
                        : '/images/avatar-default.svg'
                }
                alt={user.name}
            />
            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                {getInitials(user.name)}
            </AvatarFallback>
        </Avatar>
    );
}
