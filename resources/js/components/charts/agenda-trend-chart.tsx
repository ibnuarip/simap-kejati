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
        <div className="bg-card rounded-lg border px-3 py-2 text-xs shadow-md">
            <p className="font-medium">{label}</p>
            <p className="text-muted-foreground">
                Agenda masuk:{' '}
                <span className="text-foreground font-semibold">{value}</span>
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
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
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
                                stopOpacity={0.22}
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
                        strokeDasharray="3 3"
                    />
                    <XAxis
                        dataKey="label"
                        axisLine={false}
                        tick={{ fontSize: 12, fill: colors.mutedForeground }}
                        tickLine={false}
                    />
                    <YAxis
                        allowDecimals={false}
                        axisLine={false}
                        tick={{ fontSize: 12, fill: colors.mutedForeground }}
                        tickLine={false}
                        width={32}
                    />
                    <Tooltip
                        content={<TrendTooltip />}
                        cursor={{ stroke: colors.border }}
                    />
                    <Area
                        type="monotone"
                        dataKey="total"
                        name="Agenda"
                        stroke={colors.primary}
                        strokeWidth={2}
                        fill={`url(#${gradientId})`}
                        activeDot={{ r: 4, fill: colors.primary }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
