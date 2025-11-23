import {
  Component,
  Input,
  HostListener,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GraphNodeData } from '../../data-types/node.model';

export type ExtendedGraphNodeData = GraphNodeData & { value?: string | number };

@Component({
  selector: 'svg:g[app-square-node]',
  templateUrl: './square-node.html',
  styleUrls: ['./square-node.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SquareNode {
  @Input() nodeData!: ExtendedGraphNodeData;
  @Input() scale: number = 0.2;

  public isSelected: boolean = false;
  @Output() nodeClicked = new EventEmitter<ExtendedGraphNodeData>();
  @Output() nodeValueChange = new EventEmitter<ExtendedGraphNodeData>();

  isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private nodeStartX: number = 0;
  private nodeStartY: number = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  onValueChange(newValue: string): void {
    this.nodeData.value = newValue;
    this.nodeValueChange.emit(this.nodeData);
  }

  onMouseDown(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (target.tagName === 'INPUT') {
      return;
    }

    if (event.button !== 0) return;

    event.stopPropagation(); // Stop event from propagating up to the graph canvas (to prevent pan)
    event.preventDefault(); // Stop default browser action

    this.nodeClicked.emit(this.nodeData);

    this.isDragging = true;

    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.nodeStartX = this.nodeData.xPos;
    this.nodeStartY = this.nodeData.yPos;
  }

  public select() {
    this.isSelected = true;
    this.cdr.detectChanges();
  }

  public deselect() {
    this.isSelected = false;
    this.cdr.detectChanges();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;

    // 🔥 ADDED: Prevent selection/scrolling while dragging node
    event.preventDefault();

    const dx = event.clientX - this.dragStartX;
    const dy = event.clientY - this.dragStartY; // Calculate graph-space movement based on the current zoom scale

    const graphDx = dx / this.scale;
    const graphDy = dy / this.scale;

    this.nodeData.xPos = this.nodeStartX + graphDx;
    this.nodeData.yPos = this.nodeStartY + graphDy;
    this.cdr.detectChanges(); // Force change detection as drag is outside Angular zone
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (this.isDragging) {
      this.isDragging = false;
      this.cdr.detectChanges(); // Added to update cursor/class status immediately
    }
  }
}
