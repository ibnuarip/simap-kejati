import { usePage } from '@inertiajs/react';

import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { name } = usePage().props;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md">
                <AppLogoIcon className="size-6 object-contain" />
            </div>
            <div className="ml-1 grid min-w-0 flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-bold">
                    {name && name !== 'Laravel' ? name : 'SIMAP KEJATI'}
                </span>
                <span className="truncate text-[10px] leading-tight font-medium tracking-wide text-white">
                    KEJAKSAAN TINGGI JABAR
                </span>
            </div>
        </>
    );
}
