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
        <div className="bg-card rounded-lg border px-3 py-2 text-xs shadow-md">
            <p className="font-medium">{entry.name}</p>
            <p className="text-muted-foreground">
                Jumlah:{' '}
                <span className="text-foreground font-semibold">
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
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
            <div className="h-44 w-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="total"
                            nameKey="name"
                            innerRadius="64%"
                            outerRadius="100%"
                            paddingAngle={2}
                            stroke="none"
                        >
                            {data.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<DonutTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <ul className="flex w-full flex-col gap-2.5">
                {data.map((entry) => {
                    const percent = Math.round((entry.total / total) * 100);

                    return (
                        <li
                            key={entry.name}
                            className="flex items-center justify-between gap-3"
                        >
                            <span className="flex min-w-0 items-center gap-2">
                                <span
                                    className="size-2.5 shrink-0 rounded-sm"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="truncate text-sm">
                                    {entry.name}
                                </span>
                            </span>
                            <span className="text-muted-foreground text-sm font-medium tabular-nums">
                                {entry.total} · {percent}%
                            </span>
                        </li>
                    );
                })}

                <li className="text-muted-foreground mt-1 flex items-center justify-between border-t pt-2 text-xs">
                    <span>Total agenda</span>
                    <span className="text-foreground font-semibold tabular-nums">
                        {total}
                    </span>
                </li>
            </ul>
        </div>
    );
}
