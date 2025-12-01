import { IPointer } from './pointer.interface';
import { ICanvasTransforms } from './canvas-transforms.interface';
import { ICanvasVisibility } from './canvas-visibility.interface';
import { ICanvasNode } from './canvas-node.interface';

export interface ISelectionBox {
  startX: number;
  startY: number;
  width: number;
  height: number;
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
  selectedNodesIds: string[];
  allNodes: ICanvasNode[];
}
