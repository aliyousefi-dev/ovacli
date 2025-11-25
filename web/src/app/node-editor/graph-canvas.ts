import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NodeEditorInputDirective } from './input-directive';
import { NodeBox } from './node-box/node-box';
import { CanvasStatus } from './canvas-status';
import { CanvasStatusBar } from './canvas-status-bar/canvas-status-bar';
import { ICanvasNode } from './interfaces/ICanvasNode';
import { ShortcutInfo } from './shortcut-info/shortcut-info';
import { ToggleUI } from './buttons/toggle-ui/toggle-ui';
import { ResetView } from './buttons/reset-view/reset-view';

@Component({
  selector: 'app-graph-canvas',
  templateUrl: './graph-canvas.html',
  styleUrls: ['./graph-canvas.css'],
  standalone: true,
  imports: [
    CommonModule,
    NodeEditorInputDirective,
    NodeBox,
    CanvasStatusBar,
    ShortcutInfo,
    ToggleUI,
    ResetView,
  ],
})
export class GraphCanvas {
  @ViewChild('graphContent', { static: true }) graphContent!: ElementRef; // --- State for Panning ---

  lastMouseX = 0;
  lastMouseY = 0; // --- State for Dragging Offset (for node move correction) ---

  private dragOffsetX = 0;
  private dragOffsetY = 0;

  node01: ICanvasNode = {
    label: 'Node 01',
    isSelected: false,
    position: { x: 0, y: 0 },
    zIndex: 0,
    inputPins: [{ pinLabel: 'In1' }, { pinLabel: 'In2' }, { pinLabel: 'In3' }],
    outputPins: [{ pinLabel: 'Out1' }, { pinLabel: 'Out2' }],
  };

  node02: ICanvasNode = {
    label: 'Node 02',
    isSelected: false,
    position: { x: 300, y: 300 },
    zIndex: 0,
    inputPins: [{ pinLabel: 'In1' }, { pinLabel: 'In2' }],
    outputPins: [{ pinLabel: 'Out1' }, { pinLabel: 'Out2' }],
  }; // NOTE: Assuming CanvasStatus now includes a 'selectionBox' property with startX/Y, endX/Y, and isDrawing.

  public canvasStatus: CanvasStatus = new CanvasStatus(20000, 20000);

  constructor(private elementRef: ElementRef) {
    // Initialize CSS variable for background grid scaling
    this.elementRef.nativeElement.style.setProperty(
      '--scale',
      this.canvasStatus.transforms.scale.toString()
    );
  }
  /**
   * Generates the CSS transform string for the HTML template.
   */

  get transformStyle(): string {
    return `translate(${this.canvasStatus.transforms.translateX}px, ${this.canvasStatus.transforms.translateY}px) scale(${this.canvasStatus.transforms.scale})`;
  } // --- Selection Box Getters (NEW) --- // Calculate the top-left X coordinate of the selection box

  get selectBoxX(): number {
    // @ts-ignore (Assuming selectionBox exists on CanvasStatus)
    return Math.min(
      this.canvasStatus.selectionBox.startX,
      this.canvasStatus.selectionBox.endX
    );
  } // Calculate the top-left Y coordinate of the selection box

  get selectBoxY(): number {
    // @ts-ignore (Assuming selectionBox exists on CanvasStatus)
    return Math.min(
      this.canvasStatus.selectionBox.startY,
      this.canvasStatus.selectionBox.endY
    );
  } // Calculate the width of the selection box (absolute difference)

  get selectWidth(): number {
    // @ts-ignore (Assuming selectionBox exists on CanvasStatus)
    return Math.abs(
      this.canvasStatus.selectionBox.startX -
        this.canvasStatus.selectionBox.endX
    );
  } // Calculate the height of the selection box (absolute difference)

  get selectHeight(): number {
    // @ts-ignore (Assuming selectionBox exists on CanvasStatus)
    return Math.abs(
      this.canvasStatus.selectionBox.startY -
        this.canvasStatus.selectionBox.endY
    );
  } // --- Mouse Handlers Updated for Selection Box ---

  onMouseDown(event: MouseEvent) {
    // 1. Node Dragging (highest priority)
    if (this.canvasStatus.hoveredNode) {
      this.canvasStatus.pointer.isDraggingNode = true;
      this.canvasStatus.pointer.nodeBeingDragged =
        this.canvasStatus.hoveredNode;

      const canvasRect =
        this.graphContent.nativeElement.getBoundingClientRect();
      const scale = this.canvasStatus.transforms.scale;
      const translateX = this.canvasStatus.transforms.translateX;
      const translateY = this.canvasStatus.transforms.translateY; // Calculate mouse screen position relative to the canvas viewport

      const screenX = event.clientX - canvasRect.left;
      const screenY = event.clientY - canvasRect.top; // Convert mouse screen position to World Coordinate System (WCS)

      const worldX = (screenX - translateX) / scale;
      const worldY = (screenY - translateY) / scale;

      const node = this.canvasStatus.hoveredNode; // Store the offset

      this.dragOffsetX = node.position.x - worldX;
      this.dragOffsetY = node.position.y - worldY;

      event.preventDefault();
    }
    // 2. Panning (Middle Click)
    else if (event.button === 1) {
      this.canvasStatus.pointer.isPanning = true;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;

      this.elementRef.nativeElement.style.cursor = 'grabbing';

      event.preventDefault();
    }
    // 3. Selection Box (Left Click on empty space)
    else if (event.button === 0) {
      // @ts-ignore (Assuming selectionBox exists on CanvasStatus)
      this.canvasStatus.selectionBox.isDrawing = true;

      // Record starting screen coordinates
      const canvasRect =
        this.graphContent.nativeElement.getBoundingClientRect();
      const startX = event.clientX - canvasRect.left;
      const startY = event.clientY - canvasRect.top;

      // @ts-ignore
      this.canvasStatus.selectionBox.startX = startX;
      // @ts-ignore
      this.canvasStatus.selectionBox.startY = startY;
      // @ts-ignore
      this.canvasStatus.selectionBox.endX = startX; // Initialize end
      // @ts-ignore
      this.canvasStatus.selectionBox.endY = startY; // Initialize end
    }
  }

  onMouseMove(event: MouseEvent) {
    this.canvasStatus.pointer.x = event.clientX;
    this.canvasStatus.pointer.y = event.clientY; // 1. Node Dragging

    if (this.canvasStatus.pointer.isDraggingNode) {
      const canvasRect =
        this.graphContent.nativeElement.getBoundingClientRect();

      const scale = this.canvasStatus.transforms.scale;
      const translateX = this.canvasStatus.transforms.translateX;
      const translateY = this.canvasStatus.transforms.translateY; // Convert mouse screen position to current World Coordinate System (WCS)

      const screenX = event.clientX - canvasRect.left;
      const screenY = event.clientY - canvasRect.top;
      const currentWorldX = (screenX - translateX) / scale;
      const currentWorldY = (screenY - translateY) / scale;

      const node = this.canvasStatus.pointer.nodeBeingDragged!; // Apply the stored offset to the current WCS position

      node.position.x = currentWorldX + this.dragOffsetX;
      node.position.y = currentWorldY + this.dragOffsetY;
    }
    // 2. Panning
    else if (this.canvasStatus.pointer.isPanning) {
      const dx = event.clientX - this.lastMouseX;
      const dy = event.clientY - this.lastMouseY;

      this.canvasStatus.pointer.deltaX = dx;
      this.canvasStatus.pointer.deltaY = dy;

      this.canvasStatus.transforms.translateX += dx;
      this.canvasStatus.transforms.translateY += dy;

      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
    }
    // 3. Selection Box Drawing
    // @ts-ignore (Assuming selectionBox exists on CanvasStatus)
    else if (this.canvasStatus.selectionBox.isDrawing) {
      // Update the end screen coordinates of the selection box
      const canvasRect =
        this.graphContent.nativeElement.getBoundingClientRect();
      // @ts-ignore
      this.canvasStatus.selectionBox.endX = event.clientX - canvasRect.left;
      // @ts-ignore
      this.canvasStatus.selectionBox.endY = event.clientY - canvasRect.top;
    }
  }

  onMouseUp() {
    // 1. Stop Node Dragging
    if (this.canvasStatus.pointer.isDraggingNode) {
      this.canvasStatus.pointer.isDraggingNode = false;
      this.canvasStatus.pointer.nodeBeingDragged = null;
    }
    // 2. Stop Panning
    else if (this.canvasStatus.pointer.isPanning) {
      this.canvasStatus.pointer.isPanning = false;
      this.elementRef.nativeElement.style.cursor = 'default';
    }
    // 3. Stop Selection Box Drawing
    // @ts-ignore (Assuming selectionBox exists on CanvasStatus)
    else if (this.canvasStatus.selectionBox.isDrawing) {
      // Here you would implement the logic to check which nodes fall inside the box
      // For now, we just stop drawing and reset the state.
      // @ts-ignore
      this.canvasStatus.selectionBox.isDrawing = false;
    }
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    event.preventDefault();

    const rect = this.elementRef.nativeElement.getBoundingClientRect(); // 1. Calculate mouse position (normalized to the canvas top-left)
    const clientX = event.clientX - rect.left;
    const clientY = event.clientY - rect.top; // 2. Calculate coordinates *before* the current transformation (content coordinates)

    const x =
      (clientX - this.canvasStatus.transforms.translateX) /
      this.canvasStatus.transforms.scale;
    const y =
      (clientY - this.canvasStatus.transforms.translateY) /
      this.canvasStatus.transforms.scale; // 3. Determine the new scale

    const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;

    let newScale = this.canvasStatus.transforms.scale * zoomFactor; // Clamp the scale to the defined min/max bounds
    newScale = Math.max(
      this.canvasStatus.transforms.MinScale,
      Math.min(this.canvasStatus.transforms.MaxScale, newScale)
    ); // Prevent re-calculation if the scale is unchanged (due to clamping)

    if (newScale === this.canvasStatus.transforms.scale) {
      return;
    } // Update Transforms

    this.canvasStatus.transforms.scale = newScale;
    this.canvasStatus.transforms.translateX = clientX - x * newScale;
    this.canvasStatus.transforms.translateY = clientY - y * newScale;
  }
}
