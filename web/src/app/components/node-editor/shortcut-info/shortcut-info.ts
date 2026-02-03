import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICanvasStatus } from '../interfaces/canvas-status.interface';

@Component({
  selector: 'shortcut-info',
  // Note: The positioning classes (absolute top-5 left-5) are included
  // in the host element here to keep the component self-contained and easy to place.

  standalone: true,
  imports: [CommonModule],
  templateUrl: './shortcut-info.html',
})
export class ShortcutInfo {
  @Input({ required: true })
  canvasStatusData!: ICanvasStatus;
}
