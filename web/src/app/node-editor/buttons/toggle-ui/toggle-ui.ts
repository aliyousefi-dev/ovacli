// canvas-status-indicator.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICanvasStatus } from '../../interfaces/ICanvasStatus';

@Component({
  selector: 'toggle-ui', // Changed to be more descriptive
  standalone: true,
  imports: [CommonModule], // Add DecimalPipe for the 'number' pipe
  templateUrl: './toggle-ui.html',
})
export class ToggleUI {
  // Use the interface to define the required input property
  @Input({ required: true })
  canvasStatusData!: ICanvasStatus; // '!' is for definite assignment, assuming the parent provides it

  toggleUIVisibility() {
    this.canvasStatusData.visibility.showShortcutInfo =
      !this.canvasStatusData.visibility.showShortcutInfo;
    this.canvasStatusData.visibility.showStatusBar =
      !this.canvasStatusData.visibility.showStatusBar;
  }
}
