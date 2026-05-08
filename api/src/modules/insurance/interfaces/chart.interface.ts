import { ChartType, ChartColorScheme } from '../enums/chart.enum';

export interface ChartConfig {
  type: ChartType;
  title?: string;
  subtitle?: string;
  width?: number;
  height?: number;
  colorScheme?: ChartColorScheme;
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  animation?: boolean;
  legend?: {
    display?: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right';
    labels?: {
      fontColor?: string;
      fontSize?: number;
    };
  };
  tooltips?: {
    enabled?: boolean;
    mode?: 'point' | 'single' | 'index' | 'nearest' | 'dataset' | 'x' | 'y';
    callbacks?: {
      label?: (context: any) => string;
    };
  };
}

export interface ChartDataPoint {
  x: number | string | Date;
  y: number;
  label?: string;
  color?: string;
}

export interface ChartDataset {
  label: string;
  data: ChartDataPoint[] | number[] | string[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
  pointRadius?: number;
  pointHoverRadius?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartResponse {
  config: ChartConfig;
  data: ChartData;
  svg?: string;
  png?: Buffer;
  base64?: string;
  metadata?: {
    generatedAt: Date;
    dataPoints: number;
    chartType: ChartType;
    cacheKey?: string;
  };
}

export interface ChartQueryParams {
  startDate: Date;
  endDate: Date;
  chartType: ChartType;
  width?: number;
  height?: number;
  colorScheme?: ChartColorScheme;
  cacheable?: boolean;
}
