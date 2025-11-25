import { IPointer } from './interfaces/IPointer';
import { ICanvasTransforms } from './interfaces/ICanvasTransforms';
import { ICanvasStatus } from './interfaces/ICanvasStatus';
import { ICanvasVisibility } from './interfaces/ICanvasVisibility';
import { ICanvasNode } from './interfaces/ICanvasNode';
import { ISelectionBox } from './interfaces/ICanvasStatus';

export class CanvasStatus implements ICanvasStatus {
  pointer: IPointer;
  transforms: ICanvasTransforms;
  visibility: ICanvasVisibility;
  hoveredNode: ICanvasNode | null;
  canvasHeight: number;
  canvasWidth: number;
  selectedNodes: ICanvasNode[];
  selectionBox: ISelectionBox;

  constructor(width: number, height: number) {
    this.canvasHeight = height;
    this.canvasWidth = width;
    this.selectedNodes = [];
    this.selectionBox = {
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      isDrawing: false,
    };
    this.pointer = {
      x: 0,
      y: 0,
      deltaX: 0,
      deltaY: 0,
      isPanning: false,
      isSelecting: false,
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
      translateX: 0,
      translateY: 0,
      MinScale: 0.2,
      MaxScale: 5,
    };
  }
}
