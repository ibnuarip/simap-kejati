import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function useDashboardLoading() {
    const [isReady, setIsReady] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setIsReady(true));

        const removeStart = router.on('start', (event) => {
            if (event.detail.visit.method === 'get' && !event.detail.visit.prefetch) {
                setIsNavigating(true);
            }
        });

        const removeFinish = router.on('finish', () => {
            setIsNavigating(false);
        });

        return () => {
            cancelAnimationFrame(frame);
            removeStart();
            removeFinish();
        };
    }, []);

    return {
        isLoading: !isReady || isNavigating,
        isReady,
    };
}

export function StatCardContentSkeleton() {
    return (
        <div
            className="flex flex-col gap-1.5 py-0.5"
            aria-busy="true"
            aria-label="Memuat statistik"
        >
            <Skeleton className="h-6 w-12 md:h-7" />
            <Skeleton className="h-3.5 w-28" />
        </div>
    );
}

export function ChartSkeleton({
    className = 'h-52 2xl:h-68',
}: {
    className?: string;
}) {
    return (
        <div
            className={`flex flex-col justify-end gap-2 ${className}`}
            aria-busy="true"
            aria-label="Memuat grafik"
        >
            <Skeleton className="flex-1 rounded-lg" />
            <Skeleton className="h-4 w-2/3 rounded" />
        </div>
    );
}

export function AgendaListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <ul
            className="divide-border flex flex-col divide-y"
            aria-busy="true"
            aria-label="Memuat daftar agenda"
        >
            {Array.from({ length: count }, (_, index) => (
                <li
                    key={index}
                    className="-mx-2 flex items-start gap-3 rounded-xl px-2 py-3.5 first:-mt-2 last:-mb-2"
                >
                    <Skeleton className="size-12 shrink-0 rounded-xl" />
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-20 rounded-full" />
                            <Skeleton className="h-3.5 w-24" />
                        </div>
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex flex-wrap items-center gap-3">
                            <Skeleton className="h-3.5 w-28" />
                            <Skeleton className="h-3.5 w-24" />
                            <Skeleton className="h-3.5 w-20" />
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
}

export function StatusSummarySkeleton({ count = 4 }: { count?: number }) {
    return (
        <div
            className="flex flex-col gap-3.5"
            aria-busy="true"
            aria-label="Memuat ringkasan status agenda"
        >
            {Array.from({ length: count }, (_, index) => (
                <div key={index} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Skeleton className="size-2.5 shrink-0 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-4 w-14" />
                    </div>
                    <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
            ))}
            <div className="mt-1 flex items-center justify-between border-t pt-3">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-4 w-8" />
            </div>
        </div>
    );
}

export function RecentActivitySkeleton({ count = 4 }: { count?: number }) {
    return (
        <div
            className="divide-border flex flex-col divide-y"
            aria-busy="true"
            aria-label="Memuat aktivitas terbaru"
        >
            {Array.from({ length: count }, (_, index) => (
                <div
                    key={index}
                    className="-mx-3 flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-3"
                >
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <Skeleton className="h-4 w-3/5 max-w-xs" />
                        <Skeleton className="h-3.5 w-48" />
                    </div>
                    <Skeleton className="h-5 w-20 rounded-full" />
                </div>
            ))}
        </div>
    );
}

