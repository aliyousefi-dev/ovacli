import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';

import { ApexChart, ApexAxisChartSeries, ApexDataLabels } from 'ng-apexcharts';

// Use 'string[]' for labels instead of 'any' for better type safety
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  stroke: ApexStroke;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
};

export type ChartOptions2 = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  stroke: ApexStroke;
  colors: string[];
  legend: ApexLegend;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
};

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './stats.page.html',
})
export class StatsPage {
  public userChart: Partial<ChartOptions>;
  public userChart2: Partial<ChartOptions2>;

  constructor() {
    // The data assigned here MUST match the ChartOptions structure exactly
    this.userChart = {
      series: [
        {
          name: 'TotalVideos',
          data: [10, 41, 35, 51, 49, 62, 69, 91, 148],
        },
        {
          name: 'TotalUsers',
          data: [2, 3, 2, 5, 10, 20, 30, 50, 60],
        },
      ],
      chart: {
        type: 'area',
        height: 500,
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
    };

    this.userChart2 = {
      series: [76, 67, 61, 90],
      chart: {
        type: 'radialBar',
        height: 500,
      },
      stroke: {
        lineCap: 'round',
      },
      plotOptions: {
        radialBar: {
          offsetY: 0,
          startAngle: 0,
          endAngle: 270,
          hollow: {
            margin: 5,
            size: '30%',
            background: 'transparent',
            image: undefined,
          },
          dataLabels: {
            name: {
              show: false,
            },
            value: {
              show: false,
            },
          },
        },
      },
      colors: ['#1ab7ea', '#0084ff', '#39539E', '#0077B5'],
      labels: ['Vimeo', 'Messenger', 'Facebook', 'LinkedIn'],
      legend: {
        show: true,
        floating: true,
        fontSize: '16px',
        position: 'right',
        offsetX: 50,
        offsetY: 10,
        labels: {
          useSeriesColors: true,
        },
        formatter: function (seriesName, opts) {
          return seriesName + ':  ' + opts.w.globals.series[opts.seriesIndex];
        },
        itemMargin: {
          horizontal: 3,
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              show: false,
            },
          },
        },
      ],
    };
  }
}
