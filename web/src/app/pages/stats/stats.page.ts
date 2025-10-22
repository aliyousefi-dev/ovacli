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

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './stats.page.html',
})
export class StatsPage {
  public userChart: Partial<ChartOptions>;

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
        width: 500,
        type: 'area',
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
    };
  }
}
