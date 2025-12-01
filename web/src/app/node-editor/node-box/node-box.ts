import {
  Component,
  Input,
  HostListener,
  ElementRef,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NodeInputPin } from '../node-socket/node-socket';
import { ICanvasNode } from '../interfaces/canvas-node.interface';
import { ICanvasStatus } from '../interfaces/canvas-status.interface';

import { NodeControllerDirective } from '../directives/node-controller.directive';

@Component({
  selector: 'node-box',
  templateUrl: './node-box.html',
  styleUrls: ['./node-box.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, NodeInputPin, NodeControllerDirective],
})
export class NodeBox implements AfterViewInit {
  @Input() nodedata!: ICanvasNode;
  @Input() canvasStatus!: ICanvasStatus;
  @ViewChild('nodeDiv') nodeElementRef!: ElementRef;

  get isSelected(): boolean {
    return this.canvasStatus.selectedNodesIds.includes(this.nodedata.id);
  }

  ngAfterViewInit(): void {
    if (this.nodeElementRef) {
      const element = this.nodeElementRef.nativeElement;
      this.nodedata.width = element.offsetWidth;
      this.nodedata.height = element.offsetHeight;
    } else {
      console.error('nodeDiv reference not found.');
    }
  }
}
