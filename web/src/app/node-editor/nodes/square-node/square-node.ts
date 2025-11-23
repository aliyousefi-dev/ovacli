// square-node.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'svg:g[app-square-node]',
  templateUrl: './square-node.html',
  // IMPORTANT: Reference the new CSS file
  styleUrls: ['./square-node.css'],
  standalone: true,
  imports: [CommonModule],
})
export class SquareNode {
  @Input() x: number = 0;
  @Input() y: number = 0;
}
