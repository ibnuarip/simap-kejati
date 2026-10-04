import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
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

    if (data.length === 0) {
        return (
            <p className="text-muted-foreground rounded-lg border border-dashed py-10 text-center text-sm">
                Belum ada data tren agenda.
            </p>
        );
    }

    const max = Math.max(...data.map((point) => point.total), 0);

    return (
        <div className="h-64 w-full sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 12, right: 12, left: -12, bottom: 0 }}
                    barCategoryGap="28%"
                >
                    <CartesianGrid
                        vertical={false}
                        stroke={colors.border}
                        strokeDasharray="4 4"
                        strokeOpacity={0.7}
                    />
                    <XAxis
                        dataKey="label"
                        axisLine={false}
                        tick={{ fontSize: 11, fill: colors.mutedForeground }}
                        tickLine={false}
                        tickMargin={10}
                        minTickGap={4}
                        interval="preserveStart"
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
                            fill: colors.primary,
                            fillOpacity: 0.08,
                        }}
                    />
                    <Bar
                        dataKey="total"
                        name="Agenda"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={26}
                        background={{
                            fill: colors.border,
                            fillOpacity: 0.22,
                            radius: 6,
                        }}
                    >
                        {data.map((point) => (
                            <Cell
                                key={point.month}
                                fill={colors.primary}
                                fillOpacity={
                                    max > 0 && point.total === max ? 1 : 0.55
                                }
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
