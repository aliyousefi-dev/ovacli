import { IPointer } from './interfaces/pointer.interface';
import { ICanvasTransforms } from './interfaces/canvas-transforms.interface';
import { ICanvasStatus } from './interfaces/canvas-status.interface';
import { ICanvasVisibility } from './interfaces/canvas-visibility.interface';
import { ICanvasNode } from './interfaces/canvas-node.interface';
import { ISelectionBox } from './interfaces/canvas-status.interface';

export class CanvasStatus implements ICanvasStatus {
  pointer: IPointer;
  transforms: ICanvasTransforms;
  visibility: ICanvasVisibility;
  hoveredNode: ICanvasNode | null;
  canvasHeight: number;
  canvasWidth: number;
  selectedNodesIds: string[];
  selectionBox: ISelectionBox;
  allNodes: ICanvasNode[];

  constructor(width: number, height: number) {
    this.canvasHeight = height;
    this.canvasWidth = width;
    this.selectedNodesIds = [];
    this.allNodes = [];
    this.selectionBox = {
      startX: 0,
      startY: 0,
      width: 0,
      height: 0,
      isDrawing: false,
    };
    this.pointer = {
      x: 0,
      y: 0,
      deltaX: 0,
      deltaY: 0,
      isPanning: false,
      isDraggingNode: false,
      nodeBeingDragged: null,
    };
    this.hoveredNode = null;
    this.visibility = {
      showStatusBar: true,
      showShortcutInfo: true,
    };
    this.transforms = {
      scale: 1,
      panX: 0,
      panY: 0,
      MinScale: 0.2,
      MaxScale: 5,
    };
  }
}
