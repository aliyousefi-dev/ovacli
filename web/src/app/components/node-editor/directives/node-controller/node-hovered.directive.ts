// node-hovered.directive.ts
import { Directive, Input, HostListener } from '@angular/core';
import { ICanvasNode } from '../../interfaces/canvas-node.interface';
import { ICanvasStatus } from '../../interfaces/canvas-status.interface';

@Directive({
  selector: '[nodeHovered]',
  standalone: true,
})
export class NodeHoveredDirective {
  // 1. Inputs to receive the data and status from the host component
  @Input() canvasNode!: ICanvasNode;
  @Input() canvasStatus!: ICanvasStatus;

  // 2. The @HostListener to detect the mouse entering the host element
  @HostListener('mouseenter', ['$event'])
  public onMouseEnter(event: MouseEvent): void {
    if (this.canvasStatus && this.canvasNode) {
      this.canvasStatus.hoveredNode = this.canvasNode;
    }
    event.stopPropagation(); // Stop the event from propagating to the canvas container
  }

  // 3. The @HostListener to detect the mouse leaving the host element
  @HostListener('mouseleave')
  public onMouseLeave(): void {
    if (this.canvasStatus) {
      this.canvasStatus.hoveredNode = null;
    }
  }
}
