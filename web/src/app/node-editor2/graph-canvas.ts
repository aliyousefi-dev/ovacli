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
  PinDragStartEvent,
} from './nodes/square-node/square-node';
import { ICanvasNode, createCanvasNode } from './data-types/canvas-node';
import { ICanvasEdge } from './data-types/canvas-edge';
import { ShortcutInfo } from './help/shortcut-info/shortcut-info';
import { CanvasStatusBar } from './help/canvas-status/canvas-status-bar';
import { ContextMenu } from './context-menu/context-menu';
import { CanvasStatus } from './core/canvas-status';
import {
  NodeEditorInputDirective,
  NodeEditorHostEvents,
} from './input-directive';
import { Edge } from './edge/edge';

// Define a type to store the initial state of the node for dragging
interface DragNodeState {
  node: ICanvasNode;
  startX: number;
  startY: number;
}

// Define state for drawing a connection
interface ConnectionState {
  isDrawing: boolean;
  sourceNodeId: string | null;
  sourcePinIndex: number | null;
  currentScreenX: number;
  currentScreenY: number;
}

@Component({
  selector: 'app-graph-old',
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
    Edge, // Added
  ],
})
export class GraphCanvasOld implements AfterViewInit {
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
  selectBoxY: number = 0;

  isNodeDragging: boolean = false;
  dragScreenStartX: number = 0;
  dragScreenStartY: number = 0;
  draggedNodesInitialState: DragNodeState[] = [];

  // New properties for edges and connection state
  edges: ICanvasEdge[] = [];
  connectionState: ConnectionState = {
    isDrawing: false,
    sourceNodeId: null,
    sourcePinIndex: null,
    currentScreenX: 0,
    currentScreenY: 0,
  };

  nodes: ICanvasNode[] = [
    createCanvasNode(0, 0, 'Query'),
    createCanvasNode(200, 50, 'Tag'),
    createCanvasNode(-100, 150, 'Request'),
  ];

  constructor(private renderer: Renderer2, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
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
      | { DuplicateNode: NodeEditorHostEvents['DuplicateNode'] }
  ) {
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
        case 'DuplicateNode':
          this.handleDuplicateNode();
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
      // Node size is 120x80 centered around (xPos, yPos)
      const nodeHalfWidth = 60;
      const nodeHalfHeight = 40;

      const nodeMinX = nodeData.position.x - nodeHalfWidth;
      const nodeMaxX = nodeData.position.x + nodeHalfWidth;
      const nodeMinY = nodeData.position.y - nodeHalfHeight;
      const nodeMaxY = nodeData.position.y + nodeHalfHeight;

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

  onOutputPinDragStart(event: PinDragStartEvent): void {
    // Stop any existing node drag/selection box drawing
    this.isNodeDragging = false;
    this.canvasStatus.selectionBox.isDrawing = false;

    this.connectionState = {
      isDrawing: true,
      sourceNodeId: event.node.id,
      sourcePinIndex: event.pinIndex,
      currentScreenX: event.screenX,
      currentScreenY: event.screenY,
    };
    this.cdr.detectChanges();
  }

  onNodeDragStart(event: NodeDragStartEvent): void {
    // Ensure connection drawing stops
    if (this.connectionState.isDrawing) return;

    this.isNodeDragging = true;
    this.dragScreenStartX = event.screenX;
    this.dragScreenStartY = event.screenY;

    let nodesToDrag = this.nodeComponents
      .filter((c) => c.isSelected)
      .map((c) => c.nodeData);

    if (!nodesToDrag.find((n) => n.id === event.node.id)) {
      nodesToDrag = [event.node];
    }

    this.draggedNodesInitialState = nodesToDrag.map((node) => ({
      node: node,
      startX: node.position.x,
      startY: node.position.y,
    }));

    this.cdr.detectChanges();
  }

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent): void {
    // Update mouse position for context menu placement and zoom centering
    const containerRect =
      this.graphContainer.nativeElement.getBoundingClientRect();
    this.canvasStatus.mouseX = event.clientX - containerRect.left;
    this.canvasStatus.mouseY = event.clientY - containerRect.top;

    if (this.connectionState.isDrawing) {
      event.preventDefault();
      this.connectionState.currentScreenX = this.canvasStatus.mouseX;
      this.connectionState.currentScreenY = this.canvasStatus.mouseY;
      this.cdr.detectChanges();
      return;
    }

    if (this.isNodeDragging) {
      event.preventDefault();

      const dx = event.clientX - this.dragScreenStartX;
      const dy = event.clientY - this.dragScreenStartY;

      const graphDx = dx / this.canvasStatus.scale;
      const graphDy = dy / this.canvasStatus.scale;

      this.draggedNodesInitialState.forEach((state) => {
        state.node.position.x = state.startX + graphDx;
        state.node.position.y = state.startY + graphDy;
      });

      this.cdr.detectChanges();
      return;
    }

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

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    // End Node Dragging
    if (this.isNodeDragging) {
      this.isNodeDragging = false;
      this.draggedNodesInitialState = [];
      this.cdr.detectChanges();
      return;
    }

    // End Connection Drawing
    if (this.connectionState.isDrawing) {
      event.preventDefault();
      const target = event.target as HTMLElement;
      const inputPinWrapper = target.closest('.input-pin-wrapper');

      if (inputPinWrapper) {
        const targetNodeEl = target.closest('svg:g[app-square-node]');

        if (targetNodeEl) {
          const targetNodeId = targetNodeEl.getAttribute('data-node-id');
          const targetNodeComponent = this.nodeComponents.find(
            (c) => c.nodeData.id === targetNodeId
          );

          if (
            targetNodeComponent &&
            this.connectionState.sourceNodeId !== targetNodeId
          ) {
            const targetPinIndex = parseInt(
              inputPinWrapper.getAttribute('data-pin-index') || '0',
              10
            );

            // Check if this connection already exists
            const exists = this.edges.some(
              (edge) =>
                edge.sourceNodeId === this.connectionState.sourceNodeId &&
                edge.sourcePinIndex === this.connectionState.sourcePinIndex &&
                edge.targetNodeId === targetNodeId &&
                edge.targetPinIndex === targetPinIndex
            );

            if (!exists) {
              const newEdge: ICanvasEdge = {
                id: `edge-${Date.now()}-${Math.random()}`,
                sourceNodeId: this.connectionState.sourceNodeId!,
                sourcePinIndex: this.connectionState.sourcePinIndex!,
                targetNodeId: targetNodeId!,
                targetPinIndex: targetPinIndex,
              };
              this.edges.push(newEdge);
              console.log('New Edge created:', newEdge);
            }
          }
        }
      }

      this.connectionState = {
        isDrawing: false,
        sourceNodeId: null,
        sourcePinIndex: null,
        currentScreenX: 0,
        currentScreenY: 0,
      };
      this.cdr.detectChanges();
      return;
    }

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
    }

    if (this.canvasStatus.isPanning) {
      this.canvasStatus.isPanning = false;
      this.renderer.removeClass(this.graphContainer.nativeElement, 'isPanning');
      this.cdr.detectChanges();
    }
  }

  // Helper function to get the world coordinates of a pin
  getPinWorldPosition(
    nodeId: string,
    pinType: 'input' | 'output',
    pinIndex: number
  ): { x: number; y: number } | null {
    const nodeComponent = this.nodeComponents.find(
      (c) => c.nodeData.id === nodeId
    );
    if (nodeComponent) {
      return nodeComponent.getPinWorldPosition(pinType, pinIndex);
    }
    return null;
  }

  onMouseDown(event: MouseEvent): void {
    // Check if the target is a pin wrapper (input or output)
    const targetIsPin =
      (event.target as HTMLElement).closest('.input-pin-wrapper') ||
      (event.target as HTMLElement).closest('.output-pin-wrapper');

    // Prevent background click from deselecting if a drag/connection is starting from a pin
    if (targetIsPin && event.button === 0) {
      return;
    }

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
  onNodeClick(clickedNodeData: ICanvasNode): void {
    const componentToSelect = this.nodeComponents.find(
      (c) => c.nodeData.id === clickedNodeData.id
    );

    if (!componentToSelect?.isSelected) {
      this.deselectAllNodes();
    }

    if (componentToSelect) {
      componentToSelect.select();
    }
  } // --- DUPLICATION LOGIC ---
  /**
   * Creates a deep copy of a node with a new, unique string ID.
   */

  private cloneNode(node: ICanvasNode): ICanvasNode {
    // 1. Create a shallow copy of the node
    const newNode = { ...node };

    // 2. Generate a new, unique ID and ensure it is a string
    newNode.id = (Date.now() + Math.random()).toString();

    // 3. Offset the position for visibility
    const offset = 20;
    newNode.position = {
      x: node.position.x + offset,
      y: node.position.y + offset,
    };

    return newNode;
  }

  private handleDuplicateNode(): void {
    const selectedNodes = this.nodeComponents
      .filter((c) => c.isSelected)
      .map((c) => c.nodeData);

    if (selectedNodes.length === 0) {
      console.log('Duplication ignored: No nodes are selected.');
      return;
    }

    // 1. Deselect the original nodes (the ones currently selected)
    this.deselectAllNodes();

    const newNodes: ICanvasNode[] = []; // 2. Duplicate nodes

    selectedNodes.forEach((node) => {
      const clonedNode = this.cloneNode(node);
      this.nodes.push(clonedNode);
      newNodes.push(clonedNode);
    });

    // 3. Wait for Angular to process the new nodes, then select the new ones
    this.cdr.detectChanges();

    setTimeout(() => {
      // Find and select the newly created components
      newNodes.forEach((newNode) => {
        const newComponent = this.nodeComponents.find(
          (c) => c.nodeData.id === newNode.id
        );
        if (newComponent) {
          newComponent.select();
        }
      });
      this.cdr.detectChanges();
    }, 0);

    console.log(`Duplicated ${newNodes.length} nodes.`);
  }
}
