// canvas-status-indicator.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICanvasStatus } from '../interfaces/ICanvasStatus';

@Component({
  selector: 'canvas-status-bar', // Changed to be more descriptive
  standalone: true,
  imports: [CommonModule], // Add DecimalPipe for the 'number' pipe
  templateUrl: './canvas-status-bar.html',
})
export class CanvasStatusBar {
  // Use the interface to define the required input property
  @Input({ required: true })
  canvasStatusData!: ICanvasStatus; // '!' is for definite assignment, assuming the parent provides it
}
