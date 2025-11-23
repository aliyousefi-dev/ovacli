// canvas-status-indicator.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasStatusData } from '../../data-types/canvas-status';

@Component({
  selector: 'app-canvas-status', // Changed to be more descriptive
  standalone: true,
  imports: [CommonModule], // Add DecimalPipe for the 'number' pipe
  templateUrl: './canvas-status.html',
})
export class CanvasStatus {
  // Use the interface to define the required input property
  @Input({ required: true })
  canvasStatusData!: CanvasStatusData; // '!' is for definite assignment, assuming the parent provides it
}
