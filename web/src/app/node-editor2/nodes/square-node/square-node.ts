import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ICanvasNode } from '../../data-types/canvas-node';
import { OutputPin } from '../output-pin/output-pin';
import { InputPin } from '../input-pin/input-pin';

// Define the new event type for node drag start
export interface NodeDragStartEvent {
  node: ICanvasNode;
  screenX: number;
  screenY: number;
}

// Define the new event type for pin connection start
export interface PinDragStartEvent {
  node: ICanvasNode;
  pinType: 'input' | 'output';
  pinIndex: number;
  screenX: number;
  screenY: number;
}

@Component({
  selector: 'svg:g[app-square-node]',
  templateUrl: './square-node.html',
  styleUrls: ['./square-node.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, OutputPin, InputPin],
})
export class SquareNode {
  @Input() nodeData!: ICanvasNode;

  public isSelected: boolean = false;
  @Output() nodeClicked = new EventEmitter<ICanvasNode>();
  @Output() nodeValueChange = new EventEmitter<ICanvasNode>();
  @Output() nodeDragStart = new EventEmitter<NodeDragStartEvent>();
  @Output() outputPinDragStart = new EventEmitter<PinDragStartEvent>(); // New event

  @ViewChildren('inputPin') inputPins!: QueryList<ElementRef>; // New view children
  @ViewChildren('outputPin') outputPins!: QueryList<ElementRef>; // New view children

  constructor(private cdr: ChangeDetectorRef) {}

  onMouseDown(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (target.tagName === 'INPUT') {
      return;
    }

    if (event.button !== 0) return;
    event.stopPropagation();

    // Check if the click originated from an output pin wrapper
    const outputPinWrapper = target.closest('.output-pin-wrapper');
    if (outputPinWrapper) {
      event.preventDefault();
      const pinIndex = parseInt(
        outputPinWrapper.getAttribute('data-pin-index') || '0',
        10
      );
      this.outputPinDragStart.emit({
        node: this.nodeData,
        pinType: 'output',
        pinIndex: pinIndex,
        screenX: event.clientX,
        screenY: event.clientY,
      });
      return;
    }

    // Existing node body drag logic
    event.preventDefault(); // 1. Signal click/selection change to parent FIRST.
    this.nodeClicked.emit(this.nodeData); // 2. Signal the parent to start drag operation SECOND.
    this.nodeDragStart.emit({
      node: this.nodeData,
      screenX: event.clientX,
      screenY: event.clientY,
    });
  }

  // New method to calculate pin world coordinates for edge drawing
  getPinWorldPosition(
    pinType: 'input' | 'output',
    index: number
  ): { x: number; y: number } | null {
    const xOffset = pinType === 'input' ? -50 : 50;
    const yOffset = -40 + 15 + index * 20;
    return {
      x: this.nodeData.position.x + xOffset,
      y: this.nodeData.position.y + yOffset,
    };
  }

  public select() {
    console.log('selected node: ' + this.nodeData.id);
    this.isSelected = true;
  }

  public deselect() {
    console.log('deselected node: ' + this.nodeData.id);
    this.isSelected = false;
  }
}
