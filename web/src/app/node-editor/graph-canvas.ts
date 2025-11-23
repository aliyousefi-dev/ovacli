// graph-canvas.ts
import {
  Component,
  HostListener,
  ElementRef,
  AfterViewInit,
  ViewChild,
  Renderer2,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SquareNode } from './nodes/square-node/square-node';

interface Node {
  id: number;
  type: string;
  x: number;
  y: number;
}

@Component({
  selector: 'app-graph',
  templateUrl: './graph-canvas.html',
  styleUrls: ['./graph-canvas.css'],
  standalone: true,
  // IMPORTANT: Add the SquareNode component to the imports array
  imports: [CommonModule, SquareNode],
})
export class GraphCanvas implements AfterViewInit {
  @ViewChild('graphContainer', { static: true })
  graphContainer!: ElementRef<HTMLDivElement>;

  // ... (existing state variables: mouseX, mouseY, scale, translateX, translateY, isPanning, panStartX, panStartY, containerWidth, containerHeight) ...
  mouseX: number = 0;
  mouseY: number = 0;
  scale: number = 1.0;
  translateX: number = 0;
  translateY: number = 0;
  isPanning: boolean = false;
  panStartX: number = 0;
  panStartY: number = 0;
  containerWidth: number = 500;
  containerHeight: number = 400;

  // New: Define the list of nodes
  nodes: Node[] = [
    { id: 1, type: 'square', x: 0, y: 0 },
    { id: 2, type: 'square', x: 200, y: 50 },
    { id: 3, type: 'square', x: -100, y: 150 },
  ];

  constructor(
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  // ... (existing ngAfterViewInit, transform getter, mouse listeners) ...
  ngAfterViewInit(): void {
    setTimeout(() => {
      // ... (existing logic to calculate container dimensions and initial pan offset) ...
      if (this.graphContainer) {
        const container = this.graphContainer.nativeElement;
        this.containerWidth = container.clientWidth;
        this.containerHeight = container.clientHeight;
        this.translateX = this.containerWidth / 2;
        this.translateY = this.containerHeight / 2;
        this.cdr.detectChanges();
      }
    }, 0);
  }

  get transform(): string {
    return `translate(${this.translateX}, ${this.translateY}) scale(${this.scale})`;
  }

  onMouseMove(event: MouseEvent): void {
    this.mouseX = event.offsetX;
    this.mouseY = event.offsetY;
    if (this.isPanning) {
      const dx = event.clientX - this.panStartX;
      const dy = event.clientY - this.panStartY;
      this.translateX += dx;
      this.translateY += dy;
      this.panStartX = event.clientX;
      this.panStartY = event.clientY;
      this.cdr.detectChanges();
    }
  }

  onMouseDown(event: MouseEvent): void {
    if (event.button === 1) {
      // Middle mouse button
      this.isPanning = true;
      this.panStartX = event.clientX;
      this.panStartY = event.clientY;
      event.preventDefault();
      this.renderer.addClass(this.graphContainer.nativeElement, 'isPanning');
      this.cdr.detectChanges();
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (this.isPanning) {
      this.isPanning = false;
      this.renderer.removeClass(this.graphContainer.nativeElement, 'isPanning');
      this.cdr.detectChanges();
    }
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    event.preventDefault();

    const zoomSpeed = 0.1;
    const delta = event.deltaY > 0 ? -zoomSpeed : zoomSpeed;
    const newScale = Math.max(0.1, Math.min(5, this.scale + delta));

    if (newScale !== this.scale) {
      const mouseX = event.offsetX;
      const mouseY = event.offsetY;

      const ratio = newScale / this.scale;

      this.translateX = mouseX - ratio * (mouseX - this.translateX);
      this.translateY = mouseY - ratio * (mouseY - this.translateY);

      this.scale = newScale;

      this.cdr.detectChanges();
    }
  }
}
