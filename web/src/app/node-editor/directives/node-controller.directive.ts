import { Directive, Input } from '@angular/core';
import { NodeDraggableDirective } from './node-controller/node-draggable.directive';
import { NodeHoveredDirective } from './node-controller/node-hovered.directive';
import { ICanvasStatus } from '../interfaces/canvas-status.interface';
import { ICanvasNode } from '../interfaces/canvas-node.interface';

@Directive({
  selector: '[nodeController]',
  hostDirectives: [
    {
      directive: NodeDraggableDirective,
      inputs: ['canvasStatus', 'canvasNode'],
    },
    {
      directive: NodeHoveredDirective,
      inputs: ['canvasStatus', 'canvasNode'],
    },
  ],
})
export class NodeControllerDirective {
  @Input() canvasStatus!: ICanvasStatus;
  @Input() canvasNode!: ICanvasNode;
}
