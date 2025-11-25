import { IPointer } from './IPointer';
import { ICanvasTransforms } from './ICanvasTransforms';
import { ICanvasVisibility } from './ICanvasVisibility';
import { ICanvasNode } from './ICanvasNode';

export interface ISelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isDrawing: boolean;
}

export interface ICanvasStatus {
  canvasHeight: number;
  canvasWidth: number;
  pointer: IPointer;
  selectionBox: ISelectionBox;
  transforms: ICanvasTransforms;
  visibility: ICanvasVisibility;
  hoveredNode: ICanvasNode | null;
  selectedNodes: ICanvasNode[];
}
