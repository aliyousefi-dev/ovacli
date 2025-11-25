import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphCanvas } from '../../node-editor/graph-canvas';
import { GraphCanvasOld } from '../../node-editor2/graph-canvas';

@Component({
  selector: 'app-graph-page',
  standalone: true,
  templateUrl: './graph.page.html',
  imports: [CommonModule, GraphCanvas, GraphCanvasOld],
})
export class GraphPage {}
