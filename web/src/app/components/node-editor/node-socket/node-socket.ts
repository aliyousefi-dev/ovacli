// node-socket.ts

import {
  Component,
  Input,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ICanvasNodePin } from '../interfaces/canvas-node-pin.interface';
import { ICanvasStatus } from '../interfaces/canvas-status.interface';
import { PinHoveredDirective } from '../directives/node-controller/pin-hovered.directive';

@Component({
  selector: 'node-socket',
  templateUrl: './node-socket.html',
  styleUrls: ['./node-socket.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, PinHoveredDirective],
})
export class NodeInputPin implements AfterViewInit, OnChanges {
  @Input() pinData!: ICanvasNodePin;
  @Input() nodeX!: number;
  @Input() nodeY!: number;
  @Input() isInput!: boolean;
  @Input() canvasStatusData!: ICanvasStatus;
  @ViewChild('pinElement') pinElement!: ElementRef;

  private relativeX: number = 0;
  private relativeY: number = 0;

  ngAfterViewInit() {
    // Defer the position calculation to ensure the view is fully rendered
    setTimeout(() => {
      const pinElement = this.pinElement.nativeElement as HTMLElement;
      const nodeElement = pinElement.closest('#nodebox');

      if (nodeElement) {
        const pinRect = pinElement.getBoundingClientRect();
        const nodeRect = nodeElement.getBoundingClientRect();

        // Calculate the pin's offset from the node's top-left corner
        let offsetX = pinRect.left - nodeRect.left;
        let offsetY = pinRect.top - nodeRect.top;

        // Adjust to the center of the pin for more accurate connections
        this.relativeX = offsetX + pinRect.width / 2;
        this.relativeY = offsetY + pinRect.height / 2;

        this.updatePinWorldPosition();
      } else {
        console.error(
          "Could not find parent node element with id 'nodebox' for position calculation."
        );
      }
    }, 100); // 100ms delay as you suggested
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.pinElement) {
      if (changes['nodeX'] || changes['nodeY']) {
        this.updatePinWorldPosition();
      }
    }
  }

  private updatePinWorldPosition(): void {
    // Pin World Position = Node World Position + Pin Local Offset
    this.pinData.position.x = this.nodeX + this.relativeX;
    this.pinData.position.y = this.nodeY + this.relativeY;
  }
}
