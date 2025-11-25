import { ICanvasStatus } from '../data-types/canvas-status';
import { ContextMenuStatusData } from '../data-types/context-menu-status';
import { ISelectionBox } from '../data-types/selection-box';
import { ICanvasNode } from '../data-types/canvas-node';

// The class holds the data and implements the required functions
export class CanvasStatus implements ICanvasStatus {
  mouseX: number;
  mouseY: number;
  scale: number;
  translateX: number;
  translateY: number;
  allNodes: ICanvasNode[];
  selectedNodes: ICanvasNode[];
  containerWidth: number;
  containerHeight: number;
  contextMenuStatus: ContextMenuStatusData;
  isPanning: boolean;
  selectionBox: ISelectionBox;

  constructor(initialWidth: number = 500, initialHeight: number = 400) {
    this.mouseX = 0;
    this.mouseY = 0;
    this.scale = 1.0;
    this.allNodes = [];
    this.selectedNodes = [];
    this.translateX = initialWidth / 2; // Initial center
    this.translateY = initialHeight / 2; // Initial center
    this.containerWidth = initialWidth;
    this.isPanning = false;
    this.containerHeight = initialHeight;
    this.selectionBox = {
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      isDrawing: false,
    };
    this.contextMenuStatus = {
      isOpen: false,
      x: 0,
      y: 0,
    };
  }
  public resetView(): void {
    this.scale = 1.0;
    this.translateX = this.containerWidth / 2;
    this.translateY = this.containerHeight / 2;
    this.closeContextMenu();
  }
  public openContextMenu(x: number, y: number): void {
    this.contextMenuStatus.x = x;
    this.contextMenuStatus.y = y;
    this.contextMenuStatus.isOpen = true;
  }

  public closeContextMenu(): void {
    this.contextMenuStatus.isOpen = false;
  }
}
