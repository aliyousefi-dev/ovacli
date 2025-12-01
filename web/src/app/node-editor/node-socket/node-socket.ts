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

@Component({
  selector: 'node-socket',
  templateUrl: './node-socket.html',
  styleUrls: ['./node-socket.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class NodeInputPin implements AfterViewInit, OnChanges {
  @Input() pinData!: ICanvasNodePin;
  @Input() nodeX!: number;
  @Input() nodeY!: number;
  @Input() isInput!: boolean;

  @ViewChild('pinElement') pinElement!: ElementRef;

  private relativeX: number = 0;
  private relativeY: number = 0;

  ngAfterViewInit() {
    this.relativeX = this.pinElement.nativeElement.offsetLeft;
    this.relativeY = this.pinElement.nativeElement.offsetTop;

    this.updatePinWorldPosition();
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
