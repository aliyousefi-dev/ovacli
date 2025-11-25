import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICanvasStatus } from '../data-types/canvas-status';
import { ICanvasNode } from '../data-types/canvas-node';

export interface SelectionZoneResult {
  nodesToSelect: ICanvasNode['id'][];
}

@Component({
  selector: 'app-selection-box',
  standalone: true,
  imports: [CommonModule],
  template: ``,
})
export class SelectionBox {
  @Input() canvasStatus!: ICanvasStatus;

  @Output() selectionComplete = new EventEmitter<SelectionZoneResult>();

  private screenToWorld(
    screenCoord: number,
    translation: number,
    scale: number
  ): number {
    return (screenCoord - translation) / scale;
  }

  public selectNodesInZone(): void {
    const status = this.canvasStatus;
    const box = status.selectionBox;

    const minScreenX = Math.min(box.startX, box.endX);
    const maxScreenX = Math.max(box.startX, box.endX);
    const minScreenY = Math.min(box.startY, box.endY);
    const maxScreenY = Math.max(box.startY, box.endY);

    const minWorldX = this.screenToWorld(
      minScreenX,
      status.translateX,
      status.scale
    );
    const maxWorldX = this.screenToWorld(
      maxScreenX,
      status.translateX,
      status.scale
    );
    const minWorldY = this.screenToWorld(
      minScreenY,
      status.translateY,
      status.scale
    );
    const maxWorldY = this.screenToWorld(
      maxScreenY,
      status.translateY,
      status.scale
    );

    const nodesToSelect: string[] = [];

    for (const node of status.allNodes) {
      const nodeMinX = node.position.x;
      const nodeMaxX = node.position.x + node.width;
      const nodeMinY = node.position.y;
      const nodeMaxY = node.position.y + node.height;

      const isColliding =
        maxWorldX > nodeMinX &&
        minWorldX < nodeMaxX &&
        maxWorldY > nodeMinY &&
        minWorldY < nodeMaxY;

      if (isColliding) {
        nodesToSelect.push(node.id);
      }
    }

    this.selectionComplete.emit({ nodesToSelect });
  }
}
