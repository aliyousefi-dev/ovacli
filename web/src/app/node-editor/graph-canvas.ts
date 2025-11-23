import {
  Component,
  HostListener,
  ElementRef,
  AfterViewInit,
  ViewChild,
  ViewChildren,
  QueryList,
  Renderer2,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SquareNode } from './nodes/square-node/square-node';
import { GraphNodeData } from './data-types/node.model';
import { ShortcutInfo } from './help/shortcut-info/shortcut-info';
import { ExtendedGraphNodeData } from './nodes/square-node/square-node';
import { CanvasStatus } from './help/canvas-status/canvas-status';
import { CanvasStatusData } from './data-types/canvas-status';

@Component({
  selector: 'app-graph',
  templateUrl: './graph-canvas.html',
  styleUrls: ['./graph-canvas.css'],
  standalone: true,
  imports: [CommonModule, SquareNode, ShortcutInfo, CanvasStatus],
})
export class GraphCanvas implements AfterViewInit {
  @ViewChild('graphContainer', { static: true })
  graphContainer!: ElementRef<HTMLDivElement>;

  @ViewChildren(SquareNode)
  nodeComponents!: QueryList<SquareNode>;

  public canvasStatus: CanvasStatusData = {
    mouseX: 0,
    mouseY: 0,
    scale: 1.0,
    translateX: 0,
    translateY: 0,
    containerWidth: 500,
    containerHeight: 400,
  };

  // Panning State Properties
  isPanning: boolean = false;
  panStartX: number = 0;
  panStartY: number = 0;

  // Selection Box State Properties
  isSelecting: boolean = false;
  selectStartX: number = 0;
  selectStartY: number = 0;
  selectWidth: number = 0;
  selectHeight: number = 0;
  selectBoxX: number = 0; // Top-left X for the selection box (relative to container)
  selectBoxY: number = 0; // Top-left Y for the selection box (relative to container)

  // Example Node Data
  nodes: ExtendedGraphNodeData[] = [
    new GraphNodeData('n1', 'Query', 0, 0, false),
    new GraphNodeData('n2', 'Process A', 200, 50, false),
    new GraphNodeData('n3', 'End', -100, 150, false),
  ];

  constructor(
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngAfterViewInit(): void {
    // Initialize container dimensions and center the view
    setTimeout(() => {
      if (this.graphContainer) {
        const container = this.graphContainer.nativeElement;
        this.canvasStatus.containerWidth = container.clientWidth;
        this.canvasStatus.containerHeight = container.clientHeight;
        this.canvasStatus.translateX = this.canvasStatus.containerWidth / 2;
        this.canvasStatus.translateY = this.canvasStatus.containerHeight / 2;
        this.cdr.detectChanges();
      }
    }, 0);
  }

  // Helper property for SVG transform
  get transform(): string {
    return `translate(${this.canvasStatus.translateX}, ${this.canvasStatus.translateY}) scale(${this.canvasStatus.scale})`;
  }

  // --- Node Selection Logic ---

  /**
   * Transforms screen coordinates (from the selection box) into graph world coordinates.
   * @param screenX The screen coordinate X (relative to container).
   * @param screenY The screen coordinate Y (relative to container).
   * @returns An object with worldX and worldY coordinates.
   */
  private screenToWorld(
    screenX: number,
    screenY: number
  ): { worldX: number; worldY: number } {
    // Inverse transformation: screen position -> translated position -> scaled position
    const worldX =
      (screenX - this.canvasStatus.translateX) / this.canvasStatus.scale;
    const worldY =
      (screenY - this.canvasStatus.translateY) / this.canvasStatus.scale;
    return { worldX, worldY };
  }

  selectNodesInZone(): void {
    // Ensure we have a valid selection area
    if (this.selectWidth === 0 || this.selectHeight === 0) {
      return;
    }

    // 1. Determine the world coordinates of the selection box
    const selectionRect = {
      x1: this.selectBoxX,
      y1: this.selectBoxY,
      x2: this.selectBoxX + this.selectWidth,
      y2: this.selectBoxY + this.selectHeight,
    };

    const worldP1 = this.screenToWorld(selectionRect.x1, selectionRect.y1);
    const worldP2 = this.screenToWorld(selectionRect.x2, selectionRect.y2);

    // Get the normalized world bounding box for the selection
    const worldSelectMinX = Math.min(worldP1.worldX, worldP2.worldX);
    const worldSelectMaxX = Math.max(worldP1.worldX, worldP2.worldX);
    const worldSelectMinY = Math.min(worldP1.worldY, worldP2.worldY);
    const worldSelectMaxY = Math.max(worldP1.worldY, worldP2.worldY);

    // Deselect all nodes first (standard behavior for box selection)
    this.deselectAllNodes();

    // 2. Check for intersection with each node
    this.nodeComponents.forEach((nodeComponent) => {
      const nodeData = nodeComponent.nodeData;

      // NOTE: Using assumed node size (100x50). Adjust if necessary.
      const nodeWidth = 100;
      const nodeHeight = 50;

      // *** FIX APPLIED HERE: Use nodeData.xPos and nodeData.yPos ***
      const nodeMinX = nodeData.xPos;
      const nodeMaxX = nodeData.xPos + nodeWidth;
      const nodeMinY = nodeData.yPos;
      const nodeMaxY = nodeData.yPos + nodeHeight;

      // Check for AABB (Axis-Aligned Bounding Box) intersection
      const intersects =
        worldSelectMinX < nodeMaxX &&
        worldSelectMaxX > nodeMinX &&
        worldSelectMinY < nodeMaxY &&
        worldSelectMaxY > nodeMinY;

      if (intersects) {
        nodeComponent.select();
      }
    });

    this.cdr.detectChanges();
  }

  // --- Mouse & Interaction Handlers ---

  onMouseDown(event: MouseEvent): void {
    // Check if target is the large background rect or the container itself, but not a node.
    const targetIsGraphBackground =
      (event.target as HTMLElement).tagName === 'rect' ||
      (event.target as HTMLElement).classList.contains('graph-svg');

    // 1. Selection Box (Left Mouse Button - button 0)
    if (event.button === 0 && targetIsGraphBackground) {
      event.preventDefault();

      this.zone.run(() => {
        const containerRect =
          this.graphContainer.nativeElement.getBoundingClientRect();

        // Start the selection process
        this.isSelecting = true;
        this.selectStartX = event.clientX - containerRect.left;
        this.selectStartY = event.clientY - containerRect.top;
        this.selectWidth = 0;
        this.selectHeight = 0;
        this.selectBoxX = this.selectStartX;
        this.selectBoxY = this.selectStartY;

        this.cdr.detectChanges();
      });
    }
    // 2. Panning (Middle Mouse Button - button 1)
    else if (event.button === 1) {
      event.preventDefault();

      this.zone.run(() => {
        this.isPanning = true;
        this.panStartX = event.clientX;
        this.panStartY = event.clientY;

        this.renderer.addClass(this.graphContainer.nativeElement, 'isPanning');
        this.cdr.detectChanges();
      });
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const containerRect =
      this.graphContainer.nativeElement.getBoundingClientRect();
    this.canvasStatus.mouseX = event.clientX - containerRect.left;
    this.canvasStatus.mouseY = event.clientY - containerRect.top;

    // 1. Selection Drag Logic
    if (this.isSelecting) {
      event.preventDefault();
      this.zone.run(() => {
        const currentX = event.clientX - containerRect.left;
        const currentY = event.clientY - containerRect.top;

        // Calculate size, handling drag in any direction
        this.selectWidth = Math.abs(currentX - this.selectStartX);
        this.selectHeight = Math.abs(currentY - this.selectStartY);

        // Calculate the actual top-left corner (min of start/current)
        this.selectBoxX = Math.min(this.selectStartX, currentX);
        this.selectBoxY = Math.min(this.selectStartY, currentY);

        this.cdr.detectChanges();
      });
    }

    // 2. Panning Drag Logic
    if (this.isPanning) {
      event.preventDefault();

      this.zone.run(() => {
        const dx = event.clientX - this.panStartX;
        const dy = event.clientY - this.panStartY;

        this.canvasStatus.translateX += dx;
        this.canvasStatus.translateY += dy;
        this.panStartX = event.clientX;
        this.panStartY = event.clientY;

        this.cdr.detectChanges();
      });
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    // End Selection
    if (this.isSelecting) {
      this.zone.run(() => {
        // Execute selection logic if the drag distance was meaningful (more than a few pixels)
        if (this.selectWidth > 5 || this.selectHeight > 5) {
          this.selectNodesInZone();
        } else {
          // If it was just a quick click on the background, deselect all.
          this.deselectAllNodes();
        }

        this.isSelecting = false;
        // Reset properties to remove the visual box
        this.selectWidth = 0;
        this.selectHeight = 0;
        this.cdr.detectChanges();
      });
    }

    // End Panning
    if (this.isPanning) {
      this.zone.run(() => {
        this.isPanning = false;
        this.renderer.removeClass(
          this.graphContainer.nativeElement,
          'isPanning'
        );
        this.cdr.detectChanges();
      });
    }
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    event.preventDefault();

    const zoomSpeed = 0.1;
    const delta = event.deltaY > 0 ? -zoomSpeed : zoomSpeed;
    const newScale = Math.max(
      0.1,
      Math.min(5, this.canvasStatus.scale + delta)
    );

    if (newScale !== this.canvasStatus.scale) {
      const mouseX = event.offsetX;
      const mouseY = event.offsetY;

      const ratio = newScale / this.canvasStatus.scale;
      this.canvasStatus.translateX =
        mouseX - ratio * (mouseX - this.canvasStatus.translateX);
      this.canvasStatus.translateY =
        mouseY - ratio * (mouseY - this.canvasStatus.translateY);

      this.canvasStatus.scale = newScale;

      this.cdr.detectChanges();
    }
  }

  // --- Node Specific Methods ---

  deselectAllNodes(): void {
    this.nodeComponents.forEach((nodeComponent) => {
      nodeComponent.deselect();
    });
    this.cdr.detectChanges();
  }

  onNodeClick(clickedNodeData: ExtendedGraphNodeData): void {
    this.deselectAllNodes();

    const componentToSelect = this.nodeComponents.find(
      (c) => c.nodeData.id === clickedNodeData.id
    );

    if (componentToSelect) {
      componentToSelect.select();
    }
  }
}
