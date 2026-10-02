import { useId } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { useChartColors } from '@/lib/chart-colors';
import type { EventTrendPoint } from '@/types';

type Props = {
    data: EventTrendPoint[];
};

type TrendTooltipProps = {
    active?: boolean;
    label?: string | number;
    payload?: { value?: number | string | Array<number | string> }[];
};

function TrendTooltip({ active, payload, label }: TrendTooltipProps) {
    if (!active || !payload?.length) {
        return null;
    }

    const value = payload[0]?.value;

    return (
        <div className="bg-card min-w-36 rounded-xl border px-3.5 py-2.5 text-xs shadow-lg">
            <p className="text-muted-foreground mb-1 font-medium tracking-wide uppercase">
                {label}
            </p>
            <p className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Agenda masuk</span>
                <span className="text-foreground text-sm font-bold tabular-nums">
                    {value}
                </span>
            </p>
        </div>
    );
}

export function AgendaTrendChart({ data }: Props) {
    const colors = useChartColors();
    const gradientId = useId();

    if (data.length === 0) {
        return (
            <p className="text-muted-foreground rounded-lg border border-dashed py-10 text-center text-sm">
                Belum ada data tren agenda.
            </p>
        );
    }

    return (
        <div className="h-60 w-full sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 12, right: 12, left: -12, bottom: 0 }}
                >
                    <defs>
                        <linearGradient
                            id={gradientId}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor={colors.primary}
                                stopOpacity={0.32}
                            />
                            <stop
                                offset="60%"
                                stopColor={colors.primary}
                                stopOpacity={0.08}
                            />
                            <stop
                                offset="100%"
                                stopColor={colors.primary}
                                stopOpacity={0}
                            />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        vertical={false}
                        stroke={colors.border}
                        strokeDasharray="4 4"
                        strokeOpacity={0.7}
                    />
                    <XAxis
                        dataKey="label"
                        axisLine={false}
                        tick={{ fontSize: 12, fill: colors.mutedForeground }}
                        tickLine={false}
                        tickMargin={10}
                        minTickGap={8}
                    />
                    <YAxis
                        allowDecimals={false}
                        axisLine={false}
                        tick={{ fontSize: 12, fill: colors.mutedForeground }}
                        tickLine={false}
                        tickMargin={4}
                        width={30}
                    />
                    <Tooltip
                        content={<TrendTooltip />}
                        cursor={{
                            stroke: colors.primary,
                            strokeOpacity: 0.3,
                            strokeWidth: 1.5,
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="total"
                        name="Agenda"
                        stroke={colors.primary}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        fill={`url(#${gradientId})`}
                        dot={{
                            r: 3.5,
                            fill: colors.primary,
                            strokeWidth: 0,
                            fillOpacity: 0.9,
                        }}
                        activeDot={{
                            r: 5.5,
                            fill: colors.primary,
                            stroke: 'var(--card)',
                            strokeWidth: 2.5,
                        }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
