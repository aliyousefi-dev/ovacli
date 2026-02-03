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
export class NodeConnection implements OnInit {
  // Padding gives the line's stroke room to render without being clipped.
  // A value of 2-4px is usually safe.
  private readonly PADDING: number = 4;

  @Input() connection!: ICanvasConnection;

  ngOnInit(): void {
    if (!this.connection) {
      console.warn(
        'NodeConnection initialized without a valid connection input.'
      );
    }
  }

  /**
   * Calculates the required width of the SVG container, including padding.
   */
  get svgWidth(): number {
    const minX = Math.min(
      this.connection.sourcePin.position.x,
      this.connection.targetPin.position.x
    );
    const maxX = Math.max(
      this.connection.sourcePin.position.x,
      this.connection.targetPin.position.x
    );
    // The width is the distance between the points, plus padding on both sides.
    return maxX - minX + 2 * this.PADDING;
  }

  /**
   * Calculates the required height of the SVG container, including padding.
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
    // The height is the distance between the points, plus padding on both sides.
    return maxY - minY + 2 * this.PADDING;
  }

  /**
   * Calculates the top-left coordinate for positioning the absolute container div.
   */
  get svgTopLeft(): { x: number; y: number } {
    const minX = Math.min(
      this.connection.sourcePin.position.x,
      this.connection.targetPin.position.x
    );
    const minY = Math.min(
      this.connection.sourcePin.position.y,
      this.connection.targetPin.position.y
    );
    // The container's position is the top-left-most point of the line, adjusted by the padding.
    return { x: minX - this.PADDING, y: minY - this.PADDING };
  }
}
