type ChartColorSet = {
    primary: string;
    chart1: string;
    chart2: string;
    chart3: string;
    chart4: string;
    border: string;
    mutedForeground: string;
};

const CHART_COLORS: ChartColorSet = {
    primary: '#004d25',
    chart1: '#004d25',
    chart2: '#d4af37',
    chart3: '#1e3a8a',
    chart4: '#d97706',
    border: '#e2e8f0',
    mutedForeground: '#475569',
};

export function useChartColors(): ChartColorSet {
    return CHART_COLORS;
}
