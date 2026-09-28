import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
    page: number;
    pageCount: number;
    total: number;
    perPage: number;
    onPageChange: (page: number) => void;
    itemLabel?: string;
};

function visiblePages(current: number, total: number): (number | 'gap')[] {
    if (total <= 7) {
        return Array.from({ length: total }, (_, index) => index + 1);
    }

    const wanted = new Set([1, total, current - 1, current, current + 1]);
    const sorted = [...wanted]
        .filter((page) => page >= 1 && page <= total)
        .sort((a, b) => a - b);

    const pages: (number | 'gap')[] = [];
    let previous = 0;

    for (const page of sorted) {
        if (previous && page - previous > 1) {
            pages.push('gap');
        }

        pages.push(page);
        previous = page;
    }

    return pages;
}

export default function TablePagination({
    page,
    pageCount,
    total,
    perPage,
    onPageChange,
    itemLabel = 'agenda',
}: Props) {
    if (total === 0) {
        return null;
    }

    const first = (page - 1) * perPage + 1;
    const last = Math.min(page * perPage, total);

    return (
        <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm tabular-nums">
                Menampilkan {first}–{last} dari {total} {itemLabel}
            </p>

            <div className="flex items-center gap-1">
                <Button
                    size="sm"
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                    aria-label="Halaman sebelumnya"
                >
                    <ChevronLeft />
                    <span className="hidden sm:inline">Sebelumnya</span>
                </Button>

                <div className="hidden items-center gap-1 sm:flex">
                    {visiblePages(page, pageCount).map((item, index) =>
                        item === 'gap' ? (
                            <span
                                key={`gap-${index}`}
                                className="text-muted-foreground px-1 text-sm"
                            >
                                …
                            </span>
                        ) : (
                            <Button
                                key={item}
                                size="sm"
                                variant={item === page ? 'default' : 'outline'}
                                className="size-9 px-0 tabular-nums"
                                aria-label={`Halaman ${item}`}
                                onClick={() => onPageChange(item)}
                            >
                                {item}
                            </Button>
                        ),
                    )}
                </div>

                <span className="text-muted-foreground px-2 text-sm tabular-nums sm:hidden">
                    {page} / {pageCount}
                </span>

                <Button
                    size="sm"
                    variant="outline"
                    disabled={page >= pageCount}
                    onClick={() => onPageChange(page + 1)}
                    aria-label="Halaman berikutnya"
                >
                    <span className="hidden sm:inline">Berikutnya</span>
                    <ChevronRight />
                </Button>
            </div>
        </div>
    );
}
