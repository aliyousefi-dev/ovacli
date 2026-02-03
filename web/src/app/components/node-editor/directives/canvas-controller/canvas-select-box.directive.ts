// canvas-select-box.directive.ts

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

// Helper interface for rectangle calculations
interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

@Directive({
  selector: '[canvasSelectBox]',
  standalone: true,
})
export class CanvasSelectBoxDirective implements OnDestroy {
  @Input() canvasStatus!: ICanvasStatus;

  private startX = 0; // Local, unscaled start X (World Coordinate)
  private startY = 0; // Local, unscaled start Y (World Coordinate)

  private selectBox: HTMLElement | null = null;
  private unlistenMouseUp: (() => void) | null = null;
  private unlistenMouseMove: (() => void) | null = null;

  private el = inject(ElementRef<HTMLElement>); // Host element is the transformed '.graph-content'
  private renderer = inject(Renderer2);

  /**
   * Helper to parse the current transform values from the DOM.
   * This is crucial for accurately converting screen coordinates to world coordinates.
   */
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

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    // Only activate for left mouse button and if canvasStatus is available
    if (event.button !== 0 || !this.canvasStatus) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.canvasStatus.selectionBox.isDrawing = true;

    // 1. Get the current, definitive pan and scale values from the DOM
    const { currentPanX, currentPanY, currentScale } = this.parseTransform(
      this.el.nativeElement
    );

    // 2. Get the position of the fixed viewport relative to the screen
    const viewportRect =
      this.el.nativeElement.parentElement!.getBoundingClientRect();

    // 3. Calculate mouse position relative to the viewport container's top-left
    const viewportMouseX = event.clientX - viewportRect.left;
    const viewportMouseY = event.clientY - viewportRect.top;

    // 4. Convert to World Coordinates (Local, Unscaled, Unpanned)
    // WorldX = (ViewportMouseX - PanX) / Scale
    this.startX = (viewportMouseX - currentPanX) / currentScale;
    this.startY = (viewportMouseY - currentPanY) / currentScale;

    if (!this.selectBox) {
      this.createSelectBox();
    }

    // Update box using World Coordinates, which will be correctly offset by the host's transform
    this.updateSelectBox(this.startX, this.startY, 0, 0);

    // Register global listeners for mouse move and up
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

    // Re-read current pan/scale in case a simultaneous pan/zoom is occurring
    const { currentPanX, currentPanY, currentScale } = this.parseTransform(
      this.el.nativeElement
    );

    const viewportRect =
      this.el.nativeElement.parentElement!.getBoundingClientRect();

    // Calculate current mouse position relative to the viewport
    const viewportMouseX = event.clientX - viewportRect.left;
    const viewportMouseY = event.clientY - viewportRect.top;

    // Convert to current World Coordinates
    const currentX = (viewportMouseX - currentPanX) / currentScale;
    const currentY = (viewportMouseY - currentPanY) / currentScale;

    // Calculate raw width and height to handle dragging in any direction
    const rawWidth = currentX - this.startX;
    const rawHeight = currentY - this.startY;

    // Determine final box position and size in World Coordinates
    const selectX = Math.min(this.startX, currentX);
    const selectY = Math.min(this.startY, currentY);
    const selectWidth = Math.abs(rawWidth);
    const selectHeight = Math.abs(rawHeight);

    // Update the visual box using the World Coordinates
    this.updateSelectBox(selectX, selectY, selectWidth, selectHeight);
  }

  onMouseUp(event: MouseEvent) {
    if (!this.canvasStatus.selectionBox.isDrawing || !this.selectBox) {
      this.cleanupListeners();
      return;
    }

    this.canvasStatus.selectionBox.isDrawing = false;

    // Get the final rect of the selection box in World Coordinates
    const finalWorldRect: Rect = {
      x: parseFloat(this.selectBox.style.left || '0'),
      y: parseFloat(this.selectBox.style.top || '0'),
      width: parseFloat(this.selectBox.style.width || '0'),
      height: parseFloat(this.selectBox.style.height || '0'),
    };

    // Remove the visual selection box from the DOM
    this.renderer.removeChild(this.el.nativeElement, this.selectBox);
    this.selectBox = null;

    // --- Node Selection Logic ---

    // 1. Clear the previous selection.
    this.canvasStatus.selectedNodesIds = [];

    // 2. Only perform selection if the box is larger than a small threshold (not a mis-click)
    if (finalWorldRect.width > 5 && finalWorldRect.height > 5) {
      const selectionRect = finalWorldRect;

      // 3. Iterate over all nodes to check for collision
      this.canvasStatus.allNodes.forEach((node) => {
        const nodeRect = {
          x: node.position.x,
          y: node.position.y,
          width: node.width,
          height: node.height,
        };

        // 4. Perform the Axis-Aligned Bounding Box (AABB) intersection test
        const isIntersecting =
          selectionRect.x < nodeRect.x + nodeRect.width &&
          selectionRect.x + selectionRect.width > nodeRect.x &&
          selectionRect.y < nodeRect.y + nodeRect.height &&
          selectionRect.y + selectionRect.height > nodeRect.y;

        if (isIntersecting) {
          // 5. If they intersect, add the node's ID to the selection list
          this.canvasStatus.selectedNodesIds.push(node.id);
        }
      });
    }
    // --- End of Node Selection Logic ---

    this.cleanupListeners();
  }

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
      // Store World Coordinates in canvasStatus for external use
      this.canvasStatus.selectionBox.startX = x;
      this.canvasStatus.selectionBox.startY = y;
      this.canvasStatus.selectionBox.width = width;
      this.canvasStatus.selectionBox.height = height;

      // Apply World Coordinates directly to the style; the parent's transform handles the rest
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
    // Also remove the selectBox if the directive is destroyed mid-drag
    if (this.selectBox && this.selectBox.parentElement) {
      this.renderer.removeChild(this.el.nativeElement, this.selectBox);
    }
  }
}
