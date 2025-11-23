import { ContextMenuStatusData } from './context-menu-status';
import { ISelectionBox } from './selection-box';
import { ICanvasNode } from './canvas-node';

export interface ICanvasStatus {
  // Mouse position relative to the graph container (Screen coordinates)
  mouseX: number;
  mouseY: number;
  isPanning: boolean;
  // Current zoom level
  scale: number;

  allNodes: ICanvasNode[];
  selectedNodes: ICanvasNode[];
  // Selection box data
  selectionBox: ISelectionBox;

  // Translation/pan offset for the SVG transform (World offset in screen space)
  translateX: number;
  translateY: number;

  // Dimensions of the parent container element
  containerWidth: number;
  containerHeight: number;

  contextMenuStatus: ContextMenuStatusData;
}
