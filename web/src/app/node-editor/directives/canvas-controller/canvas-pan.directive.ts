import {
  Directive,
  ElementRef,
  HostBinding,
  inject,
  Renderer2,
  Input,
} from '@angular/core';

import { ICanvasStatus } from '../../interfaces/canvas-status.interface';

@Directive({
  selector: '[canvasPan]',
  host: {
    '(mousedown)': 'onMouseDown($event)',
    '(document:mousemove)': 'onMouseMove($event)',
    '(document:mouseup)': 'onMouseUp()',
  },
})
export class CanvasPanDirective {
  private el = inject(ElementRef);

  private renderer = inject(Renderer2);

  @Input() canvasPan!: ICanvasStatus;

  private isDragging = false;
  private lastX = 0;
  private lastY = 0;

  // 1. Set the default cursor to 'grab' so the user knows they can drag
  @HostBinding('style.cursor') get cursor() {
    return this.isDragging ? 'move' : 'default';
  }

  onMouseDown(event: MouseEvent) {
    // Middle mouse button only (button code 1)
    if (event.button !== 1) {
      return;
    }

    this.isDragging = true;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    event.preventDefault();

    // 2. FORCE the cursor on the entire body to 'grabbing' (or 'move')
    // This prevents the cursor from flickering if the mouse moves faster than the element
    this.renderer.setStyle(document.body, 'cursor', 'grabbing');
  }

  onMouseMove(event: MouseEvent) {
    this.canvasPan.pointer.x = event.clientX;
    this.canvasPan.pointer.y = event.clientY;

    if (!this.isDragging) return;

    const dx = event.clientX - this.lastX;
    const dy = event.clientY - this.lastY;

    this.updatePan(dx, dy);

    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }

  onMouseUp() {
    if (this.isDragging) {
      this.isDragging = false;

      // 3. Remove the forced cursor from the body
      this.renderer.removeStyle(document.body, 'cursor');
    }
  }

  private updatePan(dx: number, dy: number) {
    const el = this.el.nativeElement;
    const { currentScale, currentPanX, currentPanY } = this.parseTransform(el);

    const newPanX = currentPanX + dx;
    const newPanY = currentPanY + dy;

    this.canvasPan.transforms.panX = newPanX;
    this.canvasPan.transforms.panY = newPanY;

    this.renderer.setStyle(
      el,
      'transform',
      `translate(${newPanX}px, ${newPanY}px) scale(${currentScale})`
    );
  }

  private parseTransform(el: HTMLElement): {
    currentScale: number;
    currentPanX: number;
    currentPanY: number;
  } {
    const transform = el.style.transform || '';
    let currentScale = 1;
    let currentPanX = 0;
    let currentPanY = 0;

    const scaleMatch = transform.match(/scale\(([^)]+)\)/);
    if (scaleMatch) {
      currentScale = parseFloat(scaleMatch[1]);
    }

    const translateMatch = transform.match(/translate\(([^)]+)\)/);
    if (translateMatch) {
      const parts = translateMatch[1]
        .split(',')
        .map((p) => parseFloat(p.trim()));
      currentPanX = parts[0] || 0;
      currentPanY = parts[1] || 0;
    }

    return { currentScale, currentPanX, currentPanY };
  }
}
