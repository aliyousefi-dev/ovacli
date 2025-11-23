import {
  Component,
  HostListener,
  ElementRef,
  AfterViewInit,
  ViewChild,
  ViewChildren,
  QueryList,
  Renderer2,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SquareNode } from './nodes/square-node/square-node';
import { GraphNodeData } from './data-types/node.model';
import { ShortcutInfo } from './help/shortcut-info/shortcut-info.component';
import { ExtendedGraphNodeData } from './nodes/square-node/square-node';

@Component({
  selector: 'app-graph',
  templateUrl: './graph-canvas.html',
  styleUrls: ['./graph-canvas.css'],
  standalone: true,
  imports: [CommonModule, SquareNode, ShortcutInfo],
})
export class GraphCanvas implements AfterViewInit {
  @ViewChild('graphContainer', { static: true })
  graphContainer!: ElementRef<HTMLDivElement>;

  @ViewChildren(SquareNode)
  nodeComponents!: QueryList<SquareNode>;

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

  nodes: ExtendedGraphNodeData[] = [
    new GraphNodeData('n1', 'Query', 0, 0, false),
    new GraphNodeData('n2', 'Process A', 200, 50, false),
    new GraphNodeData('n3', 'End', -100, 150, false),
  ];

  constructor(
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  deselectAllNodes(): void {
    this.nodeComponents.forEach((nodeComponent) => {
      nodeComponent.deselect();
    });
    this.cdr.detectChanges();
  }

  onNodeClick(clickedNodeData: ExtendedGraphNodeData): void {
    this.deselectAllNodes();

    const componentToSelect = this.nodeComponents.find(
      (c) => c.nodeData.id === clickedNodeData.id
    );

    if (componentToSelect) {
      componentToSelect.select();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
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

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const containerRect =
      this.graphContainer.nativeElement.getBoundingClientRect();
    this.mouseX = event.clientX - containerRect.left;
    this.mouseY = event.clientY - containerRect.top;

    if (this.isPanning) {
      event.preventDefault();

      this.zone.run(() => {
        const dx = event.clientX - this.panStartX;
        const dy = event.clientY - this.panStartY;

        this.translateX += dx;
        this.translateY += dy;
        this.panStartX = event.clientX;
        this.panStartY = event.clientY;

        this.cdr.detectChanges();
      });
    }
  }

  onMouseDown(event: MouseEvent): void {
    const target = event.target as HTMLElement; // 🔥 FIX: Simplified selector to only look for the attribute [app-square-node]
    const isNodeOrPin =
      target.closest('[app-square-node]') !== null || // Checks for the node component attribute
      target.closest('foreignObject') !== null;
    const isGridRect = target.tagName === 'rect';

    if (event.button === 1) {
      // Left Mouse Button logic
      // Panning: Left click + Shift
      event.preventDefault();

      this.zone.run(() => {
        this.isPanning = true;
        this.panStartX = event.clientX;
        this.panStartY = event.clientY;

        this.renderer.addClass(this.graphContainer.nativeElement, 'isPanning');
        this.cdr.detectChanges();
      });
    } else if (event.button === 1) {
      // Middle mouse button is now ignored for panning
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (this.isPanning) {
      this.zone.run(() => {
        this.isPanning = false;
        this.renderer.removeClass(
          this.graphContainer.nativeElement,
          'isPanning'
        );
        this.cdr.detectChanges();
      });
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
