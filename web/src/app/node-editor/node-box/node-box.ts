import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NodeInputPin } from '../node-input-pin/input-pin';
import { NodeOutputPin } from '../node-output-pin/node-output-pin';
import { ICanvasNode } from '../interfaces/ICanvasNode';
import { ICanvasStatus } from '../interfaces/ICanvasStatus';

@Component({
  selector: 'node-box',
  templateUrl: './node-box.html',
  styleUrls: ['./node-box.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, NodeInputPin, NodeOutputPin],
})
export class NodeBox {
  @Input() nodedata!: ICanvasNode;
  @Input() canvasStatus!: ICanvasStatus;

  get positionStyle(): string {
    return `top: ${this.nodedata.position.y}px; left: ${this.nodedata.position.x}px;`;
  }

  get isSelected(): boolean {
    return this.canvasStatus.selectedNodes.includes(this.nodedata);
  }

  @HostListener('mousedown')
  public mouseClick(): void {
    this.canvasStatus.selectedNodes = [this.nodedata];
  }

  @HostListener('mouseenter')
  public mouseenterListener(): void {
    this.canvasStatus.hoveredNode = this.nodedata;
  }

  @HostListener('mouseleave')
  public mouseleaveListener(): void {
    this.canvasStatus.hoveredNode = null;
  }
}
