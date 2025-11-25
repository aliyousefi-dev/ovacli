import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'svg:path[app-edge]',
  template: '',
  standalone: true,
  imports: [CommonModule],
  host: {
    '[attr.d]': 'dAttribute',
    '[attr.stroke]': 'color',
    'stroke-width': '2',
    fill: 'none',
  },
})
export class Edge {
  @Input() sourceX: number = 0;
  @Input() sourceY: number = 0;
  @Input() targetX: number = 0;
  @Input() targetY: number = 0;
  @Input() color: string = 'currentColor';

  // Calculates the SVG path string for a Cubic Bézier curve
  get dAttribute(): string {
    // Control points are offset horizontally based on half the distance
    const dx = Math.abs(this.sourceX - this.targetX) * 0.5;
    const cp1x = this.sourceX + dx;
    const cp1y = this.sourceY;
    const cp2x = this.targetX - dx;
    const cp2y = this.targetY;

    // M: MoveTo, C: Cubic Bézier Curve
    return `M ${this.sourceX} ${this.sourceY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${this.targetX} ${this.targetY}`;
  }
}
