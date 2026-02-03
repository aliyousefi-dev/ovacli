import { Directive, Input } from '@angular/core';
import { CanvasPanDirective } from './canvas-controller/canvas-pan.directive';
import { CanvasZoomDirective } from './canvas-controller/canvas-zoom.directive';
import { CanvasSelectBoxDirective } from './canvas-controller/canvas-select-box.directive';
import { ICanvasStatus } from '../interfaces/canvas-status.interface';

@Directive({
  selector: '[canvasController]',
  hostDirectives: [
    {
      directive: CanvasZoomDirective,
      inputs: ['canvasZoom: canvasController'],
    },
    {
      directive: CanvasPanDirective,
      inputs: ['canvasPan: canvasController'],
    },
    {
      directive: CanvasSelectBoxDirective,
      inputs: ['canvasStatus: canvasController'],
    },
  ],
})
export class CanvasControllerDirective {
  @Input() canvasController!: ICanvasStatus;
}
