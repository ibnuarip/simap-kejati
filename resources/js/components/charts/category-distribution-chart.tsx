import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategoryDistribution } from '@/types';

type Props = {
    data: CategoryDistribution[];
};

type DonutTooltipProps = {
    active?: boolean;
    payload?: { payload?: CategoryDistribution }[];
};

function DonutTooltip({ active, payload }: DonutTooltipProps) {
    const entry = payload?.[0]?.payload;

    if (!active || !entry) {
        return null;
    }

    return (
        <div className="bg-card min-w-32 rounded-xl border px-3.5 py-2.5 text-xs shadow-lg">
            <p className="mb-1 flex items-center gap-1.5 font-medium">
                <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: entry.color }}
                />
                <span className="truncate">{entry.name}</span>
            </p>
            <p className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Jumlah</span>
                <span className="text-foreground text-sm font-bold tabular-nums">
                    {entry.total}
                </span>
            </p>
        </div>
    );
}

export function CategoryDistributionChart({ data }: Props) {
    const total = data.reduce((sum, item) => sum + item.total, 0);

    if (data.length === 0 || total === 0) {
        return (
            <p className="text-muted-foreground rounded-lg border border-dashed py-10 text-center text-sm">
                Belum ada distribusi kategori agenda.
            </p>
        );
    }

    return (
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <div className="relative h-44 w-44 shrink-0 sm:h-52 sm:w-52">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="total"
                            nameKey="name"
                            innerRadius="68%"
                            outerRadius="100%"
                            paddingAngle={3}
                            cornerRadius={4}
                            stroke="var(--card)"
                            strokeWidth={2}
                        >
                            {data.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<DonutTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-foreground text-2xl font-bold tabular-nums sm:text-3xl">
                        {total}
                    </p>
                    <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                        Agenda
                    </p>
                </div>
            </div>

            <ul className="flex max-h-64 w-full min-w-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
                {data.map((entry) => {
                    const percent = Math.round((entry.total / total) * 100);

                    return (
                        <li key={entry.name} className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between gap-3">
                                <span className="flex min-w-0 items-center gap-2">
                                    <span
                                        className="size-2.5 shrink-0 rounded-full"
                                        style={{
                                            backgroundColor: entry.color,
                                        }}
                                    />
                                    <span className="truncate text-sm font-medium">
                                        {entry.name}
                                    </span>
                                </span>
                                <span className="shrink-0 text-sm tabular-nums">
                                    <span className="text-foreground font-bold">
                                        {entry.total}
                                    </span>{' '}
                                    <span className="text-muted-foreground text-xs font-medium">
                                        · {percent}%
                                    </span>
                                </span>
                            </div>
                            <div
                                className="bg-muted h-1.5 overflow-hidden rounded-full"
                                role="progressbar"
                                aria-valuenow={percent}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={entry.name}
                            >
                                <div
                                    className="h-full rounded-full transition-[width] duration-500"
                                    style={{
                                        width: `${percent}%`,
                                        backgroundColor: entry.color,
                                    }}
                                />
                            </div>
                        </li>
                    );
                })}

                <li className="text-muted-foreground mt-1 flex items-center justify-between border-t pt-2.5 text-xs font-medium">
                    <span>Total agenda</span>
                    <span className="text-foreground text-sm font-bold tabular-nums">
                        {total}
                    </span>
                </li>
            </ul>
        </div>
    );
}
