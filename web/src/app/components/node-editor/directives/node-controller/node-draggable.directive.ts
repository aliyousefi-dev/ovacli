import {
  Directive,
  ElementRef,
  Input,
  Renderer2,
  HostBinding,
  inject,
  OnInit,
} from '@angular/core';
import { ICanvasStatus } from '../../interfaces/canvas-status.interface';
import { ICanvasNode } from '../../interfaces/canvas-node.interface';

@Directive({
  selector: '[nodeDraggable]',
  host: {
    '(mousedown)': 'onMouseDown($event)',
    '(document:mousemove)': 'onMouseMove($event)',
    '(document:mouseup)': 'onMouseUp()',
  },
})
export class NodeDraggableDirective implements OnInit {
  @Input() canvasStatus!: ICanvasStatus;
  @Input() canvasNode!: ICanvasNode;

  private isDragging = false;
  private startMouseX = 0;
  private startMouseY = 0;
  private startNodeX = 0; // ✨ Added
  private startNodeY = 0; // ✨ Added

  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  ngOnInit() {
    // Ensure the node is rendered at its initial position
    this.updatePosition(this.canvasNode.position.x, this.canvasNode.position.y);
  }

  @HostBinding('style.cursor') get cursor() {
    return this.isDragging ? 'grabbing' : 'default';
  }

  onMouseDown(event: MouseEvent) {
    if (event.button !== 0) return;

    event.stopPropagation();
    event.preventDefault();

    this.isDragging = true;
    // Capture starting mouse position (screen coordinates)
    this.startMouseX = event.clientX;
    this.startMouseY = event.clientY;

    // Capture starting node position (world coordinates) ✨ FIX
    this.startNodeX = this.canvasNode.position.x;
    this.startNodeY = this.canvasNode.position.y;
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;

    // Calculate mouse delta (movement distance) corrected for canvas scale
    const dx =
      (event.clientX - this.startMouseX) / this.canvasStatus.transforms.scale;
    const dy =
      (event.clientY - this.startMouseY) / this.canvasStatus.transforms.scale;

    // Calculate new position relative to the starting node position (startNodeX/Y) ✨ FIX
    const newX = this.startNodeX + dx;
    const newY = this.startNodeY + dy;

    this.updatePosition(newX, newY);
  }

  onMouseUp() {
    if (this.isDragging) {
      this.isDragging = false;
    }
  }

  private updatePosition(x: number, y: number) {
    // Update the model data
    this.canvasNode.position.x = x;
    this.canvasNode.position.y = y; // Apply the transformation to the DOM

    this.renderer.setStyle(
      this.el.nativeElement,
      'transform',
      `translate(${x}px, ${y}px)`
    );
  }
}
