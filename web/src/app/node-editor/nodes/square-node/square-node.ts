import {
  Component,
  Input,
  HostListener,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ICanvasNode } from '../../data-types/canvas-node';

// Define the new event type for drag start
export interface NodeDragStartEvent {
  node: ICanvasNode;
  screenX: number;
  screenY: number;
}

@Component({
  selector: 'svg:g[app-square-node]',
  templateUrl: './square-node.html',
  styleUrls: ['./square-node.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class SquareNode {
  @Input() nodeData!: ICanvasNode;
  @Input() scale: number = 0.2;

  public isSelected: boolean = false;
  @Output() nodeClicked = new EventEmitter<ICanvasNode>();
  @Output() nodeValueChange = new EventEmitter<ICanvasNode>();
  @Output() nodeDragStart = new EventEmitter<NodeDragStartEvent>();

  constructor(private cdr: ChangeDetectorRef) {}

  onMouseDown(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (target.tagName === 'INPUT') {
      return;
    }

    if (event.button !== 0) return;

    event.stopPropagation();
    event.preventDefault(); // 1. Signal click/selection change to parent FIRST.

    // This allows GraphCanvas.onNodeClick to update 'isSelected' logic.
    this.nodeClicked.emit(this.nodeData); // 2. Signal the parent to start drag operation SECOND.
    this.nodeDragStart.emit({
      node: this.nodeData,
      screenX: event.clientX,
      screenY: event.clientY,
    });
  }

  public select() {
    console.log('selected node: ' + this.nodeData.id);
    this.isSelected = true;
    this.cdr.detectChanges();
  }

  public deselect() {
    console.log('deselected node: ' + this.nodeData.id);
    this.isSelected = false;
    this.cdr.detectChanges();
  }
}
