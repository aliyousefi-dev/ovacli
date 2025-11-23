import {
  Component,
  ElementRef,
  AfterViewInit,
  ViewChild,
  ViewChildren,
  QueryList,
  Renderer2,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  SquareNode,
  NodeDragStartEvent,
} from './nodes/square-node/square-node';
import { ICanvasNode, createCanvasNode } from './data-types/canvas-node';
import { ShortcutInfo } from './help/shortcut-info/shortcut-info';
import { CanvasStatusBar } from './help/canvas-status/canvas-status-bar';
import { ContextMenu } from './context-menu/context-menu';
import { CanvasStatus } from './core/canvas-status';
import {
  NodeEditorInputDirective,
  NodeEditorHostEvents,
} from './input-directive';

// Define a type to store the initial state of the node for dragging
interface DragNodeState {
  node: ICanvasNode;
  startX: number;
  startY: number;
}

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
  selectBoxX: number = 0;
  selectBoxY: number = 0; // NEW: Multi-node Dragging State

  isNodeDragging: boolean = false;
  dragScreenStartX: number = 0;
  dragScreenStartY: number = 0;
  draggedNodesInitialState: DragNodeState[] = [];

  nodes: ICanvasNode[] = [
    createCanvasNode(0, 0, 'Query'),
    createCanvasNode(200, 50, 'Tag'),
    createCanvasNode(-100, 150, 'Request'),
  ];

  constructor(private renderer: Renderer2, private cdr: ChangeDetectorRef) {}

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

  get transform(): string {
    return `translate(${this.canvasStatus.translateX}, ${this.canvasStatus.translateY}) scale(${this.canvasStatus.scale})`;
  }

  handleHostEvent(
    event:
      | keyof NodeEditorHostEvents
      | { Pan: NodeEditorHostEvents['Pan'] }
      | { ZoomInOut: NodeEditorHostEvents['ZoomInOut'] }
      | { OnPointerDown: NodeEditorHostEvents['OnPointerDown'] }
  ) {
    // ... (unchanged Pan/Zoom/PointerDown logic)
    if (typeof event === 'string') {
      switch (event) {
        case 'OpenContextMenu':
          this.openContextMenu(
            this.canvasStatus.mouseX,
            this.canvasStatus.mouseY
          );
          break;
        case 'FocusNode':
          console.log('FocusNode event received: Implement focus logic.');
          break;
      }
    } else if ('Pan' in event) {
      this.canvasStatus.translateX += event.Pan.deltaX;
      this.canvasStatus.translateY += event.Pan.deltaY;
      if (!this.canvasStatus.isPanning) {
        this.canvasStatus.isPanning = true;
        this.renderer.addClass(this.graphContainer.nativeElement, 'isPanning');
      }
    } else if ('ZoomInOut' in event) {
      const zoomDelta = event.ZoomInOut.delta;
      const zoomSpeed = 0.1;
      const delta = zoomDelta > 0 ? -zoomSpeed : zoomSpeed;
      const newScale = Math.max(
        0.1,
        Math.min(5, this.canvasStatus.scale + delta)
      );

      if (newScale !== this.canvasStatus.scale) {
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
      const { x, y } = event.OnPointerDown;
      this.canvasStatus.mouseX = x;
      this.canvasStatus.mouseY = y;
      console.log(`Pointer down at: (${x}, ${y})`);
    }
    this.cdr.detectChanges();
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
    // ... (unchanged selectNodesInZone logic)
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
  } // --- Context Menu Handlers (unchanged) ---
  private openContextMenu(x: number, y: number): void {
    this.canvasStatus.contextMenuStatus.x = x;
    this.canvasStatus.contextMenuStatus.y = y;
    this.canvasStatus.contextMenuStatus.isOpen = true;
    this.cdr.detectChanges();
  }

  closeContextMenu(): void {
    if (this.canvasStatus.contextMenuStatus.isOpen) {
      this.canvasStatus.contextMenuStatus.isOpen = false;
      this.cdr.detectChanges();
    }
  }
  /**
   * Handles the start of a drag operation from a node.
   * Initializes the state for dragging the selected group or the single node.
   */

  onNodeDragStart(event: NodeDragStartEvent): void {
    this.isNodeDragging = true;
    this.dragScreenStartX = event.screenX;
    this.dragScreenStartY = event.screenY; // The nodeClicked event already fired and updated the selection state. // We now collect ALL currently selected nodes.

    let nodesToDrag = this.nodeComponents
      .filter((c) => c.isSelected)
      .map((c) => c.nodeData);

    // Safety check: If for some reason the clicked node wasn't selected (shouldn't happen),
    // ensure it's in the list to be dragged.
    if (!nodesToDrag.find((n) => n.id === event.node.id)) {
      nodesToDrag = [event.node];
    } // Store the current world position of ALL nodes we intend to drag

    this.draggedNodesInitialState = nodesToDrag.map((node) => ({
      node: node,
      startX: node.xPos,
      startY: node.yPos,
    }));

    this.cdr.detectChanges();
  }

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent): void {
    // Update mouse position for context menu placement and zoom centering
    const containerRect =
      this.graphContainer.nativeElement.getBoundingClientRect();
    this.canvasStatus.mouseX = event.clientX - containerRect.left;
    this.canvasStatus.mouseY = event.clientY - containerRect.top; // Handle Node Dragging

    if (this.isNodeDragging) {
      event.preventDefault();

      const dx = event.clientX - this.dragScreenStartX;
      const dy = event.clientY - this.dragScreenStartY; // Apply scale correction to screen delta

      const graphDx = dx / this.canvasStatus.scale;
      const graphDy = dy / this.canvasStatus.scale; // Update position of ALL dragged nodes

      this.draggedNodesInitialState.forEach((state) => {
        state.node.xPos = state.startX + graphDx;
        state.node.yPos = state.startY + graphDy;
      });

      this.cdr.detectChanges();
      return; // Prevent selection box logic from running during node drag
    } // Selection Drag Logic (only runs if not node dragging)

    if (this.canvasStatus.selectionBox.isDrawing) {
      event.preventDefault();
      const currentX = this.canvasStatus.mouseX;
      const currentY = this.canvasStatus.mouseY;

      this.selectWidth = Math.abs(currentX - this.selectStartX);
      this.selectHeight = Math.abs(currentY - this.selectStartY);

      this.selectBoxX = Math.min(this.selectStartX, currentX);
      this.selectBoxY = Math.min(this.selectStartY, currentY);

      this.cdr.detectChanges();
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    // End Node Dragging
    if (this.isNodeDragging) {
      this.isNodeDragging = false;
      this.draggedNodesInitialState = [];
      this.cdr.detectChanges();
      return; // Exit after handling node drag end
    } // End Selection (Original Logic)

    if (this.canvasStatus.selectionBox.isDrawing) {
      if (this.selectWidth > 5 || this.selectHeight > 5) {
        this.selectNodesInZone();
      } else {
        // If it was just a quick click on the background, deselect all.
        this.deselectAllNodes();
      }

      this.canvasStatus.selectionBox.isDrawing = false;
      this.selectWidth = 0;
      this.selectHeight = 0;
      this.cdr.detectChanges();
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
    }
  }

  deselectAllNodes(): void {
    this.nodeComponents.forEach((nodeComponent) => {
      nodeComponent.deselect();
    });
    this.closeContextMenu();
    this.cdr.detectChanges();
  }
  /**
   * Handles selection logic when a node is clicked.
   * If the node is not selected, it deselects all others before selecting this one.
   * If the node is already selected, it preserves the selection (for multi-drag).
   */

  onNodeClick(clickedNodeData: ICanvasNode): void {
    const componentToSelect = this.nodeComponents.find(
      (c) => c.nodeData.id === clickedNodeData.id
    );

    // IMPORTANT: If the clicked node is NOT currently selected, we deselect the group.
    // This allows clicking a new node to start a new single-select.
    if (!componentToSelect?.isSelected) {
      this.deselectAllNodes();
    }

    if (componentToSelect) {
      componentToSelect.select();
    }
  }
}
