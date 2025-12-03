import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NodeBox } from './node-box/node-box';
import { CanvasStatus } from './canvas-status';
import { CanvasStatusBar } from './canvas-status-bar/canvas-status-bar';
import { ICanvasNode } from './interfaces/canvas-node.interface';
import { ShortcutInfo } from './shortcut-info/shortcut-info';
import { ToggleUI } from './buttons/toggle-ui/toggle-ui';
import { ResetView } from './buttons/reset-view/reset-view';
import { NodeConnection } from './node-connection/node-connection';
import { ICanvasConnection } from './interfaces/connection.interface';
import { createNodePin } from './interfaces/canvas-node-pin.interface';
import { createCanvasNode } from './factory/create-node';
import { createCanvasConnection } from './factory/create-connection';
import { CanvasControllerDirective } from './directives/canvas-controller.directive';
import { ResetScaleBtn } from './buttons/reset-scale/reset-scale';
import { Inspector } from './inspector/inspector';

@Component({
  selector: 'app-graph-canvas',
  templateUrl: './graph-canvas.html',
  styleUrls: ['./graph-canvas.css'],
  standalone: true,
  imports: [
    CommonModule,
    NodeBox,
    CanvasStatusBar,
    ShortcutInfo,
    ToggleUI,
    ResetView,
    NodeConnection,
    CanvasControllerDirective,
    ResetScaleBtn,
    Inspector,
  ],
})
export class GraphCanvas {
  @ViewChild('graphContent', { static: true }) graphContent!: ElementRef;
  // --- State for Panning ---
  lastMouseX = 0;
  lastMouseY = 0;
  // --- State for Dragging Offset (for node move correction) ---
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  // --- Flag to track if the mouse moved significantly (to distinguish click from drag) ---
  private isDraggingOrPanning = false;

  // --- Initializing nodes with width and height properties (assuming default values) ---
  node01: ICanvasNode;
  node02: ICanvasNode;

  connection: ICanvasConnection;
  // Consolidated list for iteration

  public canvasStatus: CanvasStatus = new CanvasStatus(20000, 20000);

  constructor(private elementRef: ElementRef) {
    // Initialize CSS variable for background grid scaling
    this.elementRef.nativeElement.style.setProperty(
      '--scale',
      this.canvasStatus.transforms.scale.toString()
    );

    this.node01 = createCanvasNode(
      this.canvasStatus,
      100,
      100,
      'Node 01',
      [createNodePin('In1'), createNodePin('In2'), createNodePin('In3')],
      [createNodePin('Out1'), createNodePin('Out2')]
    );

    this.node01 = createCanvasNode(
      this.canvasStatus,
      100,
      400,
      'new',
      [createNodePin('In1'), createNodePin('In2'), createNodePin('In3')],
      [createNodePin('Out1'), createNodePin('Out2')]
    );

    this.node02 = createCanvasNode(
      this.canvasStatus,
      300,
      300,
      'Node 02',
      [createNodePin('In1'), createNodePin('In2')],
      [createNodePin('Out1'), createNodePin('Out2')]
    );

    this.connection = createCanvasConnection(
      this.node01.outputPins[0],
      this.node02.inputPins[0]
    );
    this.node01.zIndex = 1;
    this.node02.zIndex = 2;
  }

  /**
   * Generates the CSS transform string for the HTML template.
   */
  get transformStyle(): string {
    return `translate(${this.canvasStatus.transforms.panX}px, ${this.canvasStatus.transforms.panY}px) scale(${this.canvasStatus.transforms.scale})`;
  }
}
