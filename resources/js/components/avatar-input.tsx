import { useState } from 'react';
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
 * Pilih/hapus foto profil. Pratinjau lokal, responsif penuh.
 * Form Inertia mengirim multipart otomatis bila ada File.
 */
export function AvatarInput({ userId, userName, currentAvatar, error }: Props) {
    const [preview, setPreview] = useState<string | null>(null);
    const [removeChecked, setRemoveChecked] = useState(false);

    return (
        <div className="grid min-w-0 gap-2">
            <Label htmlFor="avatar">Foto Profil</Label>
            <div className="flex min-w-0 flex-wrap items-center gap-3 sm:gap-4">
                {preview ? (
                    <img
                        src={preview}
                        alt="Pratinjau foto profil"
                        className="size-16 shrink-0 rounded-full object-cover sm:size-20"
                    />
                ) : (
                    <UserAvatar
                        user={{
                            id: userId ?? -1,
                            name: userName || 'Pengguna',
                            avatar: currentAvatar ?? null,
                        }}
                        className="size-16 shrink-0 overflow-hidden rounded-full sm:size-20"
                    />
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <Input
                        id="avatar"
                        name="avatar"
                        type="file"
                        accept="image/jpeg,image/png"
                        className="file:border-input file:bg-muted hover:file:bg-accent cursor-pointer file:-mt-px file:mr-3 file:-ml-1 file:cursor-pointer file:rounded-md file:border file:px-4 file:py-2 file:text-sm file:font-medium"
                        onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;

                            setPreview(file ? URL.createObjectURL(file) : null);
                            setRemoveChecked(false);
                        }}
                    />
                    <p className="text-muted-foreground text-xs">
                        JPG, JPEG, atau PNG, maksimal 2 MB.
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
