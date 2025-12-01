import { ICanvasNode } from './canvas-node.interface';

export interface IPointer {
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
  isDraggingNode: boolean;
  nodeBeingDragged: ICanvasNode | null;
  isPanning: boolean;
}
