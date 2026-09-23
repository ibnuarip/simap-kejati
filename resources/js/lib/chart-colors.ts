import { useEffect, useState } from 'react';

type ChartColorSet = {
    primary: string;
    chart1: string;
    chart2: string;
    chart3: string;
    chart4: string;
    border: string;
    mutedForeground: string;
};

const FALLBACK_COLORS: ChartColorSet = {
    primary: '#004d25',
    chart1: '#004d25',
    chart2: '#d4af37',
    chart3: '#1e3a8a',
    chart4: '#d97706',
    border: '#e2e8f0',
    mutedForeground: '#475569',
};

const CSS_VARIABLES: Record<keyof ChartColorSet, string> = {
    primary: '--primary',
    chart1: '--chart-1',
    chart2: '--chart-2',
    chart3: '--chart-3',
    chart4: '--chart-4',
    border: '--border',
    mutedForeground: '--muted-foreground',
};

export function useChartColors(): ChartColorSet {
    const [colors, setColors] = useState<ChartColorSet>(FALLBACK_COLORS);

    useEffect(() => {
        const styles = getComputedStyle(document.documentElement);
        const next = { ...FALLBACK_COLORS };

        for (const key of Object.keys(
            CSS_VARIABLES,
        ) as (keyof ChartColorSet)[]) {
            const value = styles.getPropertyValue(CSS_VARIABLES[key]).trim();

            if (value) {
                next[key] = value;
            }
        }

        setColors(next);
    }, []);

    return colors;
}
