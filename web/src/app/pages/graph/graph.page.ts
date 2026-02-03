import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphCanvas } from '../../components/node-editor/graph-canvas';

@Component({
  selector: 'app-graph-page',
  standalone: true,
  templateUrl: './graph.page.html',
  imports: [CommonModule, GraphCanvas],
})
export class GraphPage {}
