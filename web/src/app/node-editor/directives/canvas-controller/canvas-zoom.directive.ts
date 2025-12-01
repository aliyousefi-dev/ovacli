import {
  Directive,
  ElementRef,
  HostListener,
  Renderer2,
  Input,
  inject,
} from '@angular/core';
import { ICanvasStatus } from '../../interfaces/canvas-status.interface';

@Directive({
  selector: '[canvasZoom]',
  host: {
    '(wheel)': 'onWheel($event)',
  },
})
export class CanvasZoomDirective {
  @Input() canvasZoom!: ICanvasStatus;

  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  private readonly ZOOM_FACTOR = 0.1;
  private readonly MIN_ZOOM = 0.2;
  private readonly MAX_ZOOM = 3.0;

  onWheel(event: WheelEvent) {
    event.preventDefault();

    const delta = event.deltaY > 0 ? -this.ZOOM_FACTOR : this.ZOOM_FACTOR;
    const el = this.el.nativeElement;

    // 1. Get current values
    const { currentScale, currentPanX, currentPanY } = this.parseTransform(el);
    const oldZoom = currentScale;

    // 2. Calculate New Zoom
    let newZoom = oldZoom + delta;
    newZoom = Math.min(Math.max(this.MIN_ZOOM, newZoom), this.MAX_ZOOM);

    // 3. Perform Zoom-to-Cursor Calculation
    const canvasRect = el.getBoundingClientRect();

    const cursorX = event.clientX - canvasRect.left;
    const cursorY = event.clientY - canvasRect.top;

    // Calculate required pan adjustment
    const zoomRatio = newZoom / oldZoom;
    const panXDelta = cursorX - cursorX * zoomRatio;
    const panYDelta = cursorY - cursorY * zoomRatio;

    // 4. Calculate new pan values
    const newPanX = currentPanX + panXDelta;
    const newPanY = currentPanY + panYDelta;

    this.canvasZoom.transforms.scale = newZoom;
    this.canvasZoom.transforms.panX = newPanX;
    this.canvasZoom.transforms.panY = newPanY;
    // 5. Write combined style
    this.renderer.setStyle(
      el,
      'transform',
      `translate(${newPanX}px, ${newPanY}px) scale(${newZoom})`
    );
  }

  // Helper to parse the current transform values
  private parseTransform(el: HTMLElement): {
    currentScale: number;
    currentPanX: number;
    currentPanY: number;
  } {
    const transform = el.style.transform || '';
    let currentScale = 1;
    let currentPanX = 0;
    let currentPanY = 0;

    // Parse scale()
    const scaleMatch = transform.match(/scale\(([^)]+)\)/);
    if (scaleMatch) {
      currentScale = parseFloat(scaleMatch[1]);
    }

    // Parse translate()
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
