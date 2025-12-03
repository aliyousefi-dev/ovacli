import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICanvasStatus } from '../interfaces/canvas-status.interface';

@Component({
  selector: 'inspector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inspector.html',
})
export class Inspector {
  @Input({ required: true })
  canvasStatusData!: ICanvasStatus;
}
