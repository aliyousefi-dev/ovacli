// canvas-select-box.directive.ts (Final Version)
import {
  Directive,
  ElementRef,
  HostListener,
  Renderer2,
  Input,
  inject,
  OnDestroy,
} from '@angular/core';
import { ICanvasStatus } from '../../interfaces/canvas-status.interface';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

@Directive({
  selector: '[canvasSelectBox]',
})
export class CanvasSelectBoxDirective implements OnDestroy {
  @Input() canvasStatus!: ICanvasStatus;

  private startX = 0; // Local, unscaled start X
  private startY = 0; // Local, unscaled start Y
  private selectBox: HTMLElement | null = null;
  private unlistenMouseUp: (() => void) | null = null;
  private unlistenMouseMove: (() => void) | null = null;

  private el = inject(ElementRef);
  private renderer = inject(Renderer2); // --- Helper to parse the current transform values from the DOM ---

  private parseTransform(el: HTMLElement): {
    currentScale: number;
    currentPanX: number;
    currentPanY: number;
  } {
    const transform = el.style.transform || '';
    let currentScale = 1;
    let currentPanX = 0;
    let currentPanY = 0; // Parse scale()

    const scaleMatch = transform.match(/scale\(([^)]+)\)/);
    if (scaleMatch) {
      currentScale = parseFloat(scaleMatch[1]);
    } // Parse translate()

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
  // -----------------------------------------------------------------

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (event.button !== 0 || !this.canvasStatus) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.canvasStatus.selectionBox.isDrawing = true;

    // ✨ NEW: Read the definitive, current pan and scale values from the DOM
    const { currentPanX, currentPanY, currentScale } = this.parseTransform(
      this.el.nativeElement
    );
    const panX = currentPanX;
    const panY = currentPanY;
    const scale = currentScale;

    const hostRect = this.el.nativeElement.getBoundingClientRect();

    // 1. Calculate raw screen position relative to host (Screen-space)
    const rawX = event.clientX - hostRect.left;
    const rawY = event.clientY - hostRect.top;

    // 2. Un-pan the coordinates
    const unpanX = rawX - panX;
    const unpanY = rawY - panY;

    // 3. Un-scale the coordinates. This is the local, unscaled position.
    this.startX = unpanX / scale;
    this.startY = unpanY / scale;

    if (!this.selectBox) {
      this.createSelectBox();
    }

    this.updateSelectBox(this.startX, this.startY, 0, 0);

    this.unlistenMouseMove = this.renderer.listen(
      'document',
      'mousemove',
      this.onMouseMove.bind(this)
    );
    this.unlistenMouseUp = this.renderer.listen(
      'document',
      'mouseup',
      this.onMouseUp.bind(this)
    );
  }

  onMouseMove(event: MouseEvent) {
    if (!this.canvasStatus.selectionBox.isDrawing || !this.selectBox) {
      return;
    }

    const { currentPanX, currentPanY, currentScale } = this.parseTransform(
      this.el.nativeElement
    );
    const panX = currentPanX;
    const panY = currentPanY;
    const scale = currentScale;

    const hostRect = this.el.nativeElement.getBoundingClientRect();

    // 1. Calculate raw screen position relative to host (Screen-space)
    const currentRawX = event.clientX - hostRect.left;
    const currentRawY = event.clientY - hostRect.top;

    // 2. Un-pan
    const currentUnpanX = currentRawX - panX;
    const currentUnpanY = currentRawY - panY;

    // 3. Un-scale to get the current local, unscaled position.
    const currentX = currentUnpanX / scale;
    const currentY = currentUnpanY / scale; // Calculate width and height using the local, unscaled coordinates

    const rawWidth = currentX - this.startX;
    const rawHeight = currentY - this.startY; // Calculate final position (x, y) and dimensions (width, height) for the displayed box

    const selectX = Math.min(this.startX, currentX);
    const selectY = Math.min(this.startY, currentY);
    const selectWidth = Math.abs(rawWidth);
    const selectHeight = Math.abs(rawHeight);

    // Update the box using the local, unscaled coordinates
    this.updateSelectBox(selectX, selectY, selectWidth, selectHeight);
  }
  onMouseUp(event: MouseEvent) {
    if (!this.canvasStatus.selectionBox.isDrawing || !this.selectBox) {
      this.cleanupListeners();
      return;
    }

    this.canvasStatus.selectionBox.isDrawing = false; // Rect is already in World/Unscaled coordinates

    const finalWorldRect: Rect = {
      x: parseFloat(this.selectBox.style.left || '0'),
      y: parseFloat(this.selectBox.style.top || '0'),
      width: parseFloat(this.selectBox.style.width || '0'),
      height: parseFloat(this.selectBox.style.height || '0'),
    }; // Remove the selection box from the DOM

    this.renderer.removeChild(this.el.nativeElement, this.selectBox);
    this.selectBox = null;

    if (finalWorldRect.width > 5 && finalWorldRect.height > 5) {
      // Emit the finalWorldRect here
      // this.selectionEnd.emit(finalWorldRect);
    }

    this.cleanupListeners();
  }
  // --- Helper Methods (Omitted for brevity, assumed correct) ---
  private createSelectBox() {
    const div = this.renderer.createElement('div');
    const classes =
      'absolute border border-blue-500 bg-blue-500/30 pointer-events-none z-20';
    classes.split(' ').forEach((cls) => this.renderer.addClass(div, cls));
    this.renderer.appendChild(this.el.nativeElement, div);
    this.selectBox = div;
  }

  private updateSelectBox(x: number, y: number, width: number, height: number) {
    if (this.selectBox) {
      this.canvasStatus.selectionBox.startX = x;
      this.canvasStatus.selectionBox.startY = y;
      this.canvasStatus.selectionBox.width = width;
      this.canvasStatus.selectionBox.height = height;

      this.renderer.setStyle(this.selectBox, 'left', `${x}px`);
      this.renderer.setStyle(this.selectBox, 'top', `${y}px`);
      this.renderer.setStyle(this.selectBox, 'width', `${width}px`);
      this.renderer.setStyle(this.selectBox, 'height', `${height}px`);
    }
  }
  private cleanupListeners() {
    if (this.unlistenMouseMove) {
      this.unlistenMouseMove();
      this.unlistenMouseMove = null;
    }
    if (this.unlistenMouseUp) {
      this.unlistenMouseUp();
      this.unlistenMouseUp = null;
    }
  }
  ngOnDestroy(): void {
    this.cleanupListeners();
  }
}
