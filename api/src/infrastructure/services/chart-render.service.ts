import { Injectable } from '@nestjs/common';
import * as echarts from 'echarts';
import { createCanvas } from 'canvas';
import {
  ChartConfig,
  ChartData,
  ChartResponse,
} from '@modules/insurance/interfaces/chart.interface';
import { ChartType, ChartColorScheme } from '@modules/insurance/enums/chart.enum';

@Injectable()
export class ChartRenderService {
  private readonly colorSchemes: Record<ChartColorScheme, string[]> = {
    [ChartColorScheme.DEFAULT]: [
      '#5470c6',
      '#91cc75',
      '#fac858',
      '#ee6666',
      '#73c0de',
      '#3ba272',
      '#fc8452',
      '#9a60b4',
      '#ea7ccc',
      '#5470c6',
    ],
    [ChartColorScheme.VIBRANT]: [
      '#ff6b6b',
      '#4ecdc4',
      '#45b7d1',
      '#f9ca24',
      '#6c5ce7',
      '#a29bfe',
      '#fd79a8',
      '#fdcb6e',
      '#00b894',
      '#0984e3',
    ],
    [ChartColorScheme.PASTEL]: [
      '#a8e6cf',
      '#dcedc1',
      '#ffd3b6',
      '#ffaaa5',
      '#ff8b94',
      '#b5ead7',
      '#c7ceea',
      '#ff9ff3',
      '#feca57',
      '#48dbfb',
    ],
    [ChartColorScheme.DARK]: [
      '#2d3436',
      '#636e72',
      '#b2bec3',
      '#6c5ce7',
      '#00cec9',
      '#74b9ff',
      '#a29bfe',
      '#fd79a8',
      '#e17055',
      '#fdcb6e',
    ],
    [ChartColorScheme.LIGHT]: [
      '#ffffff',
      '#f8f9fa',
      '#e9ecef',
      '#dee2e6',
      '#ced4da',
      '#adb5bd',
      '#6c757d',
      '#495057',
      '#343a40',
      '#212529',
    ],
    [ChartColorScheme.GRADIENT]: [
      '#ff9a9e',
      '#fecfef',
      '#fecfef',
      '#fecfef',
      '#fecfef',
      '#a1c4fd',
      '#c2e9fb',
      '#c2e9fb',
      '#c2e9fb',
      '#c2e9fb',
    ],
  };

  async renderChart(config: ChartConfig, data: ChartData): Promise<ChartResponse> {
    // 创建Canvas实例
    const canvas = createCanvas(config.width || 800, config.height || 400);
    const ctx = canvas.getContext('2d');

    // 初始化ECharts实例
    const chart = echarts.init(canvas as any);

    // 应用颜色方案
    this.applyColorScheme(config, data);

    // 设置图表选项
    const options = this.buildChartOptions(config, data);

    // 渲染图表
    chart.setOption(options);

    // 生成图表的SVG、PNG和Base64表示
    const svg = chart.getOption();
    const png = canvas.toBuffer('image/png');
    const base64 = canvas.toDataURL('image/png');

    // 清理资源
    chart.dispose();

    return {
      config,
      data,
      png,
      base64,
      metadata: {
        generatedAt: new Date(),
        dataPoints: data.datasets.reduce((sum, dataset) => sum + dataset.data.length, 0),
        chartType: config.type,
      },
    };
  }

  private applyColorScheme(config: ChartConfig, data: ChartData): void {
    const colors = this.colorSchemes[config.colorScheme || ChartColorScheme.DEFAULT];

    data.datasets.forEach((dataset, index) => {
      if (!dataset.backgroundColor) {
        if (config.type === ChartType.PIE || config.type === ChartType.DOUGHNUT) {
          // 饼图和环形图为每个数据点分配不同的颜色
          dataset.backgroundColor = colors;
        } else {
          // 其他图表为每个数据集分配一种颜色
          dataset.backgroundColor = colors[index % colors.length] + '20'; // 添加透明度
        }
      }

      if (!dataset.borderColor) {
        dataset.borderColor = colors[index % colors.length];
      }
    });
  }

  private buildChartOptions(config: ChartConfig, data: ChartData): any {
    const options: any = {
      title: config.title
        ? {
            text: config.title,
            subtext: config.subtitle,
            left: 'center',
          }
        : {},
      tooltip:
        config.tooltips?.enabled !== false
          ? {
              trigger: 'axis',
              axisPointer: {
                type: 'cross',
                label: {
                  backgroundColor: '#6a7985',
                },
              },
            }
          : {},
      legend:
        config.legend?.display !== false
          ? {
              data: data.datasets.map(dataset => dataset.label),
              top: 30,
            }
          : {},
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis:
        config.type === ChartType.PIE || config.type === ChartType.DOUGHNUT
          ? undefined
          : {
              type: 'category',
              boundaryGap: false,
              data: data.labels,
            },
      yAxis:
        config.type === ChartType.PIE || config.type === ChartType.DOUGHNUT
          ? undefined
          : {
              type: 'value',
            },
      series: data.datasets.map((dataset, index) => {
        const seriesBase = {
          name: dataset.label,
          data: this.transformDataForChart(config.type, dataset.data),
          itemStyle: {
            color: (params: any) => {
              const colors = this.colorSchemes[config.colorScheme || ChartColorScheme.DEFAULT];
              return colors[params.dataIndex % colors.length];
            },
          },
        };

        switch (config.type) {
          case ChartType.LINE:
            return {
              ...seriesBase,
              type: 'line',
              smooth: true,
              lineStyle: {
                width: dataset.borderWidth || 3,
              },
              areaStyle: {
                opacity: 0.3,
              },
            };
          case ChartType.BAR:
            return {
              ...seriesBase,
              type: 'bar',
              barWidth: '60%',
            };
          case ChartType.PIE:
            return {
              ...seriesBase,
              type: 'pie',
              radius: '50%',
              center: ['50%', '50%'],
              label: {
                formatter: '{b}: {c} ({d}%)',
              },
            };
          case ChartType.DOUGHNUT:
            return {
              ...seriesBase,
              type: 'pie',
              radius: ['40%', '70%'],
              center: ['50%', '50%'],
              label: {
                formatter: '{b}: {c} ({d}%)',
              },
            };
          case ChartType.RADAR:
            return {
              ...seriesBase,
              type: 'radar',
            };
          case ChartType.POLAR_AREA:
            return {
              ...seriesBase,
              type: 'polarArea',
            };
          default:
            return {
              ...seriesBase,
              type: config.type,
            };
        }
      }),
    };

    return options;
  }

  private transformDataForChart(type: ChartType, data: any[]): any[] {
    if (type === ChartType.PIE || type === ChartType.DOUGHNUT) {
      // 饼图和环形图需要特殊的数据格式
      return data.map((value, index) => ({
        value,
        name: `Item ${index + 1}`,
      }));
    }
    return data;
  }
}
