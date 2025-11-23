import {
  Component,
  Input,
  HostListener,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ICanvasNode } from '../../data-types/canvas-node';

@Component({
  selector: 'svg:g[app-square-node]',
  templateUrl: './square-node.html',
  styleUrls: ['./square-node.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SquareNode {
  @Input() nodeData!: ICanvasNode;
  @Input() scale: number = 0.2;

  public isSelected: WritableSignal<boolean> = signal(false);
  @Output() nodeClicked = new EventEmitter<ICanvasNode>();
  @Output() nodeValueChange = new EventEmitter<ICanvasNode>();

  isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private nodeStartX: number = 0;
  private nodeStartY: number = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  onMouseDown(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (target.tagName === 'INPUT') {
      return;
    }

    if (event.button !== 0) return;

    event.stopPropagation();
    event.preventDefault();

    this.nodeClicked.emit(this.nodeData);

    this.isDragging = true;

    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.nodeStartX = this.nodeData.xPos;
    this.nodeStartY = this.nodeData.yPos;
  }
  public select() {
    console.log('selected node: ' + this.nodeData.id);
    this.isSelected.set(true); // Update using .set()
  }

  public deselect() {
    this.isSelected.set(false); // Update using .set()
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;

    event.preventDefault();

    const dx = event.clientX - this.dragStartX;
    const dy = event.clientY - this.dragStartY;

    const graphDx = dx / this.scale;
    const graphDy = dy / this.scale;

    this.nodeData.xPos = this.nodeStartX + graphDx;
    this.nodeData.yPos = this.nodeStartY + graphDy; // This MUST remain detectChanges() since it's a drag event outside the zone
    this.cdr.detectChanges();
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (this.isDragging) {
      this.isDragging = false;
      this.cdr.detectChanges();
    }
  }
}
