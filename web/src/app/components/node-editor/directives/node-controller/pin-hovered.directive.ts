// node-hovered.directive.ts
import { Directive, Input, HostListener } from '@angular/core';
import { ICanvasStatus } from '../../interfaces/canvas-status.interface';
import { ICanvasNodePin } from '../../interfaces/canvas-node-pin.interface';

@Directive({
  selector: '[pinHovered]',
  standalone: true,
})
export class PinHoveredDirective {
  // 1. Inputs to receive the data and status from the host component
  @Input() canvasPin!: ICanvasNodePin;
  @Input() canvasStatus!: ICanvasStatus;

  // 2. The @HostListener to detect the mouse entering the host element
  @HostListener('mouseenter', ['$event'])
  public onMouseEnter(event: MouseEvent): void {
    if (this.canvasStatus && this.canvasPin) {
      this.canvasStatus.hoveredPin = this.canvasPin;
    }
    event.stopPropagation(); // Stop the event from propagating to the canvas container
  }

  // 3. The @HostListener to detect the mouse leaving the host element
  @HostListener('mouseleave')
  public onMouseLeave(): void {
    if (this.canvasStatus) {
      this.canvasStatus.hoveredPin = null;
    }
  }
}
