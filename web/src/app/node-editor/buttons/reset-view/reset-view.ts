// canvas-status-indicator.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICanvasStatus } from '../../interfaces/ICanvasStatus';

@Component({
  selector: 'reset-view', // Changed to be more descriptive
  standalone: true,
  imports: [CommonModule], // Add DecimalPipe for the 'number' pipe
  templateUrl: './reset-view.html',
})
export class ResetView {
  // Use the interface to define the required input property
  @Input({ required: true })
  canvasStatusData!: ICanvasStatus; // '!' is for definite assignment, assuming the parent provides it

  resetView() {
    this.canvasStatusData.transforms.scale = 1;
    this.canvasStatusData.transforms.translateX = 0;
    this.canvasStatusData.transforms.translateY = 0;
  }
}
