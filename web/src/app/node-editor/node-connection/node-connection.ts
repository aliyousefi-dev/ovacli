import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ICanvasConnection } from '../interfaces/connection.interface';

@Component({
  selector: 'node-connection',
  templateUrl: './node-connection.html',
  styleUrls: ['./node-connection.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
// 1. Implement OnInit
export class NodeConnection implements OnInit {
  // Define a small padding to prevent the line from touching the edge of the SVG boundary
  private readonly PADDING: number = 0;

  @Input() connection!: ICanvasConnection;

  constructor() {
    // Inputs are not available here
  }

  // 2. Add ngOnInit to ensure 'connection' is set before initial rendering/logic runs
  ngOnInit(): void {
    // Optional: Add a check if the input is critical
    if (!this.connection) {
      console.warn(
        'NodeConnection initialized without a valid connection input.'
      );
    }
  }

  get svgWidth(): number {
    const minX = Math.min(
      this.connection.sourcePin.position.x,
      this.connection.targetPin.position.x
    );
    const maxX = Math.max(
      this.connection.sourcePin.position.x,
      this.connection.targetPin.position.x
    );

    // The width is the distance between the min and max X, plus padding
    return maxX - minX + 2 * this.PADDING;
  }

  /**
   * Calculates the required height of the SVG container.
   */
  get svgHeight(): number {
    const minY = Math.min(
      this.connection.sourcePin.position.y,
      this.connection.targetPin.position.y
    );
    const maxY = Math.max(
      this.connection.sourcePin.position.y,
      this.connection.targetPin.position.y
    );

    // The height is the distance between the min and max Y, plus padding
    return maxY - minY + 2 * this.PADDING;
  }

  /**
   * Calculates the required offset for the SVG's viewBox/transformation
   */
  get svgViewBoxOffset(): { x: number; y: number } {
    const minX = Math.min(
      this.connection.sourcePin.position.x,
      this.connection.targetPin.position.x
    );
    const minY = Math.min(
      this.connection.sourcePin.position.y,
      this.connection.targetPin.position.y
    );

    // This value is the coordinate of the bottom-left corner of the content box
    return { x: minX, y: minY };
  }
}
