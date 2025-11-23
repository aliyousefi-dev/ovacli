import {
  Component,
  ElementRef,
  AfterViewInit,
  ViewChild,
  ViewChildren,
  QueryList,
  Renderer2,
  ChangeDetectorRef,
  NgZone,
  HostListener, // Keep HostListener for document:mousemove/mouseup for selection box logic
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SquareNode } from './nodes/square-node/square-node';
import { ICanvasNode, createCanvasNode } from './data-types/canvas-node';
import { ShortcutInfo } from './help/shortcut-info/shortcut-info';
import { CanvasStatusBar } from './help/canvas-status/canvas-status-bar';
import { ContextMenu } from './context-menu/context-menu';
import { CanvasStatus } from './core/canvas-status';
import {
  NodeEditorInputDirective,
  NodeEditorHostEvents,
} from './input-directive'; // Import the directive and the events interface

@Component({
  selector: 'app-graph',
  templateUrl: './graph-canvas.html',
  styleUrls: ['./graph-canvas.css'],
  standalone: true,
  imports: [
    CommonModule,
    SquareNode,
    NodeEditorInputDirective,
    ShortcutInfo,
    CanvasStatusBar,
    ContextMenu,
  ],
})
export class GraphCanvas implements AfterViewInit {
  @ViewChild('graphContainer', { static: true })
  graphContainer!: ElementRef<HTMLDivElement>;

  @ViewChildren(SquareNode)
  nodeComponents!: QueryList<SquareNode>;

  public canvasStatus: CanvasStatus = new CanvasStatus();

  selectStartX: number = 0;
  selectStartY: number = 0;
  selectWidth: number = 0;
  selectHeight: number = 0;
  selectBoxX: number = 0; // Top-left X for the selection box (relative to container)
  selectBoxY: number = 0; // Top-left Y for the selection box (relative to container) // Context Menu State Properties

  nodes: ICanvasNode[] = [
    createCanvasNode(0, 0, 'Query'),
    createCanvasNode(200, 50, 'Tag'),
    createCanvasNode(-100, 150, 'Request'),
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
  } // Helper property for SVG transform

  get transform(): string {
    return `translate(${this.canvasStatus.translateX}, ${this.canvasStatus.translateY}) scale(${this.canvasStatus.scale})`;
  }

  handleHostEvent(
    event:
      | keyof NodeEditorHostEvents
      | { Pan: NodeEditorHostEvents['Pan'] }
      | { ZoomInOut: NodeEditorHostEvents['ZoomInOut'] }
      | { OnPointerDown: NodeEditorHostEvents['OnPointerDown'] } // Added OnPointerDown case
  ) {
    this.zone.run(() => {
      if (typeof event === 'string') {
        // Handle string events (OpenContextMenu, FocusNode)
        switch (event) {
          case 'OpenContextMenu': // Open the context menu at the last known mouse position
            this.openContextMenu(
              this.canvasStatus.mouseX,
              this.canvasStatus.mouseY
            );
            break;
          case 'FocusNode': // Implement Focus Node logic here
            console.log('FocusNode event received: Implement focus logic.');
            break;
        }
      } else if ('Pan' in event) {
        // Handle Pan event
        this.canvasStatus.translateX += event.Pan.deltaX;
        this.canvasStatus.translateY += event.Pan.deltaY; // Use 'isPanning' property only for CSS class management if needed
        if (!this.canvasStatus.isPanning) {
          this.canvasStatus.isPanning = true;
          this.renderer.addClass(
            this.graphContainer.nativeElement,
            'isPanning'
          );
        }
      } else if ('ZoomInOut' in event) {
        // Handle ZoomInOut event
        const zoomDelta = event.ZoomInOut.delta;
        const zoomSpeed = 0.1;
        const delta = zoomDelta > 0 ? -zoomSpeed : zoomSpeed;
        const newScale = Math.max(
          0.1,
          Math.min(5, this.canvasStatus.scale + delta)
        );

        if (newScale !== this.canvasStatus.scale) {
          // Use the current mouse position on the container for zoom center
          const mouseX = this.canvasStatus.mouseX;
          const mouseY = this.canvasStatus.mouseY;

          const ratio = newScale / this.canvasStatus.scale;
          this.canvasStatus.translateX =
            mouseX - ratio * (mouseX - this.canvasStatus.translateX);
          this.canvasStatus.translateY =
            mouseY - ratio * (mouseY - this.canvasStatus.translateY);

          this.canvasStatus.scale = newScale;
        }
      } else if ('OnPointerDown' in event) {
        // Handle OnPointerDown event
        const { x, y } = event.OnPointerDown;
        this.canvasStatus.mouseX = x;
        this.canvasStatus.mouseY = y;
        console.log(`Pointer down at: (${x}, ${y})`);
      }
      this.cdr.detectChanges();
    });
  }

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
    if (this.selectWidth === 0 || this.selectHeight === 0) {
      return;
    }

    const selectionRect = {
      x1: this.selectBoxX,
      y1: this.selectBoxY,
      x2: this.selectBoxX + this.selectWidth,
      y2: this.selectBoxY + this.selectHeight,
    };

    const worldP1 = this.screenToWorld(selectionRect.x1, selectionRect.y1);
    const worldP2 = this.screenToWorld(selectionRect.x2, selectionRect.y2);

    const worldSelectMinX = Math.min(worldP1.worldX, worldP2.worldX);
    const worldSelectMaxX = Math.max(worldP1.worldX, worldP2.worldX);
    const worldSelectMinY = Math.min(worldP1.worldY, worldP2.worldY);
    const worldSelectMaxY = Math.max(worldP1.worldY, worldP2.worldY);

    this.deselectAllNodes();

    this.nodeComponents.forEach((nodeComponent) => {
      const nodeData = nodeComponent.nodeData;
      const nodeWidth = 100;
      const nodeHeight = 50;
      const nodeMinX = nodeData.xPos;
      const nodeMaxX = nodeData.xPos + nodeWidth;
      const nodeMinY = nodeData.yPos;
      const nodeMaxY = nodeData.yPos + nodeHeight;

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
  } // --- Context Menu Handlers ---

  private openContextMenu(x: number, y: number): void {
    this.zone.run(() => {
      this.canvasStatus.contextMenuStatus.x = x;
      this.canvasStatus.contextMenuStatus.y = y;
      this.canvasStatus.contextMenuStatus.isOpen = true;
      this.cdr.detectChanges();
    });
  }

  closeContextMenu(): void {
    this.zone.run(() => {
      if (this.canvasStatus.contextMenuStatus.isOpen) {
        this.canvasStatus.contextMenuStatus.isOpen = false;
        this.cdr.detectChanges();
      }
    });
  } // --- Mouse & Interaction Handlers (Only Selection and Mouse Position Logic Remains) ---

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent): void {
    // Update mouse position for context menu placement and zoom centering
    const containerRect =
      this.graphContainer.nativeElement.getBoundingClientRect();
    this.canvasStatus.mouseX = event.clientX - containerRect.left;
    this.canvasStatus.mouseY = event.clientY - containerRect.top; // Selection Drag Logic

    if (this.canvasStatus.selectionBox.isDrawing) {
      event.preventDefault();
      this.zone.run(() => {
        const currentX = this.canvasStatus.mouseX;
        const currentY = this.canvasStatus.mouseY;

        this.selectWidth = Math.abs(currentX - this.selectStartX);
        this.selectHeight = Math.abs(currentY - this.selectStartY);

        this.selectBoxX = Math.min(this.selectStartX, currentX);
        this.selectBoxY = Math.min(this.selectStartY, currentY);

        this.cdr.detectChanges();
      });
    } // NOTE: Panning logic is now entirely handled by the directive and `handleHostEvent`.
  } // @HostListener('document:mouseup')

  onMouseUp(): void {
    // End Selection
    if (this.canvasStatus.selectionBox.isDrawing) {
      this.zone.run(() => {
        // Execute selection logic if the drag distance was meaningful
        if (this.selectWidth > 5 || this.selectHeight > 5) {
          this.selectNodesInZone();
        } else {
          // If it was just a quick click on the background, deselect all.
          this.deselectAllNodes();
        }

        this.canvasStatus.selectionBox.isDrawing = false; // Reset properties to remove the visual box
        this.selectWidth = 0;
        this.selectHeight = 0;
        this.cdr.detectChanges();
      });
    } // If the directive's pan sequence ends (mouseup), reset the local CSS state
    if (this.canvasStatus.isPanning) {
      this.canvasStatus.isPanning = false;
      this.renderer.removeClass(this.graphContainer.nativeElement, 'isPanning');
      this.cdr.detectChanges();
    }
  }

  onMouseDown(event: MouseEvent): void {
    const targetIsGraphBackground =
      (event.target as HTMLElement).tagName === 'rect' ||
      (event.target as HTMLElement).classList.contains('graph-svg'); // Close context menu on any background click, regardless of button

    if (targetIsGraphBackground) {
      this.closeContextMenu();
    } // Only keep Selection Box initiation logic here (Left Mouse Button - button 0)

    if (event.button === 0 && targetIsGraphBackground) {
      event.preventDefault();

      this.zone.run(() => {
        const containerRect =
          this.graphContainer.nativeElement.getBoundingClientRect(); // Start the selection process

        this.canvasStatus.selectionBox.isDrawing = true;
        this.selectStartX = event.clientX - containerRect.left;
        this.selectStartY = event.clientY - containerRect.top;
        this.selectWidth = 0;
        this.selectHeight = 0;
        this.selectBoxX = this.selectStartX;
        this.selectBoxY = this.selectStartY;

        this.cdr.detectChanges();
      });
    } // Panning start (Middle Mouse Button) is handled by the directive's mousedown listener.
  } // @HostListener('wheel', ['$event']) // REMOVED: Handled by directive // --- Node Specific Methods ---

  deselectAllNodes(): void {
    this.nodeComponents.forEach((nodeComponent) => {
      nodeComponent.deselect();
    });
    this.closeContextMenu(); // Close menu when all nodes are deselected
    this.cdr.detectChanges();
  }

  onNodeClick(clickedNodeData: ICanvasNode): void {
    this.deselectAllNodes();

    const componentToSelect = this.nodeComponents.find(
      (c) => c.nodeData.id === clickedNodeData.id
    );

    if (componentToSelect) {
      componentToSelect.select();
    }
  }
}
