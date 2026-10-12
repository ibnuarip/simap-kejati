import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserAvatar } from '@/components/user-avatar';

type Props = {
    userId?: number | null;
    userName: string;
    currentAvatar?: string | null;
    error?: string;
};

/**
 * Pilih/hapus foto profil. Pratinjau lokal berbentuk lingkaran, berukuran
 * besar dan responsif (mobile/tablet/desktop).
 * Form Inertia mengirim multipart otomatis bila ada File.
 */
export function AvatarInput({ userId, userName, currentAvatar, error }: Props) {
    const [preview, setPreview] = useState<string | null>(null);
    const [removeChecked, setRemoveChecked] = useState(false);

    // Lepaskan object URL lama agar tidak menumpuk di memori browser.
    useEffect(() => {
        if (!preview) {
            return;
        }

        return () => URL.revokeObjectURL(preview);
    }, [preview]);

    return (
        <div className="grid min-w-0 gap-2">
            <Label htmlFor="avatar">Foto Profil</Label>
            <div className="flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
                {preview ? (
                    <img
                        src={preview}
                        alt="Pratinjau foto profil"
                        className="border-border aspect-square size-28 shrink-0 rounded-full border object-cover object-center sm:size-32"
                    />
                ) : (
                    <UserAvatar
                        user={{
                            id: userId ?? -1,
                            name: userName || 'Pengguna',
                            // Saat "Hapus foto" dicentang, langsung tampilkan
                            // avatar bawaan sebagai pratinjau hasil akhirnya.
                            avatar: removeChecked
                                ? null
                                : (currentAvatar ?? null),
                        }}
                        className="border-border size-28 shrink-0 overflow-hidden rounded-full border sm:size-32"
                    />
                )}
                <div className="flex w-full min-w-0 flex-1 flex-col gap-2">
                    <Input
                        id="avatar"
                        name="avatar"
                        type="file"
                        accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                        className="file:border-input file:bg-muted hover:file:bg-accent cursor-pointer file:-mt-px file:mr-3 file:-ml-1 file:cursor-pointer file:rounded-md file:border file:px-4 file:py-2 file:text-sm file:font-medium"
                        onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;

                            setPreview(file ? URL.createObjectURL(file) : null);
                            setRemoveChecked(false);
                        }}
                    />
                    <p className="text-muted-foreground text-xs">
                        JPG, JPEG, atau PNG, maksimal 5 MB.
                    </p>
                </div>
            </div>
            {currentAvatar ? (
                <span
                    role="checkbox"
                    aria-checked={removeChecked}
                    tabIndex={0}
                    onClick={() => setRemoveChecked((value) => !value)}
                    onKeyDown={(event) => {
                        if (event.key === ' ' || event.key === 'Enter') {
                            event.preventDefault();
                            setRemoveChecked((value) => !value);
                        }
                    }}
                    className="flex w-fit cursor-pointer items-center gap-2 text-sm"
                >
                    <Checkbox
                        name="remove_avatar"
                        value="1"
                        checked={removeChecked}
                        onCheckedChange={(value) =>
                            setRemoveChecked(value === true)
                        }
                        onClick={(event) => event.stopPropagation()}
                        tabIndex={-1}
                    />
                    <span className="inline-flex items-center gap-1.5">
                        <Trash2 className="size-3.5 shrink-0" />
                        Hapus foto saat ini
                    </span>
                </span>
            ) : null}
            <InputError message={error} />
        </div>
    );
}
