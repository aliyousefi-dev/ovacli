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

@Component({
  selector: 'app-graph',
  templateUrl: './graph-canvas.html', // Assuming this is where your HTML template is defined
  styleUrls: ['./graph-canvas.css'],
  standalone: true,
  imports: [CommonModule],
})
export class GraphCanvas implements AfterViewInit {
  // Use the template reference variable #graphContainer
  @ViewChild('graphContainer', { static: true })
  graphContainer!: ElementRef<HTMLDivElement>;

  // --- Mouse position (for display in the HTML) ---
  mouseX: number = 0;
  mouseY: number = 0;

  // --- Transformation state (for SVG <g> element) ---
  scale: number = 1.0;
  translateX: number = 0;
  translateY: number = 0;

  // --- Panning state ---
  isPanning: boolean = false;
  panStartX: number = 0; // Mouse X position when pan starts (on screen)
  panStartY: number = 0; // Mouse Y position when pan starts (on screen)

  // --- Container dimensions ---
  containerWidth: number = 500;
  containerHeight: number = 400;

  constructor(
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngAfterViewInit(): void {
    if (this.graphContainer) {
      // Get actual dimensions from the rendered element
      const container = this.graphContainer.nativeElement;
      this.containerWidth = container.clientWidth;
      this.containerHeight = container.clientHeight;

      // Set initial pan offset to center the graph origin (0,0)
      this.translateX = this.containerWidth / 2;
      this.translateY = this.containerHeight / 2;

      // CRITICAL: Ensure initial centered state is rendered
      this.cdr.detectChanges();
    }
  }

  /**
   * Getter for the SVG transform attribute
   * FIX: SVG transform does not accept 'px' units for translate().
   * We must use unitless numbers.
   */
  get transform(): string {
    return `translate(${this.translateX}, ${this.translateY}) scale(${this.scale})`;
  }

  // --- MOUSE LISTENERS ---

  onMouseMove(event: MouseEvent): void {
    // Update mouse position display relative to the container
    this.mouseX = event.offsetX;
    this.mouseY = event.offsetY;

    if (this.isPanning) {
      // Run panning logic inside NgZone if needed, but since we use cdr.detectChanges(),
      // this is often fine outside the zone for high-frequency events.
      // However, we'll keep the logic simple here.

      // Calculate the difference since the last mouse event using event.clientX/Y (screen position)
      const dx = event.clientX - this.panStartX;
      const dy = event.clientY - this.panStartY;

      // Apply the difference to the pan offset
      this.translateX += dx;
      this.translateY += dy;

      // Set the current position as the starting point for the *next* move
      this.panStartX = event.clientX;
      this.panStartY = event.clientY;

      // Manually trigger change detection for immediate visual update
      this.cdr.detectChanges();
    }
  }

  onMouseDown(event: MouseEvent): void {
    // Only start panning with the left mouse button (event.button === 0)
    if (event.button === 0) {
      this.isPanning = true;
      this.panStartX = event.clientX;
      this.panStartY = event.clientY;

      // Prevent native browser drag behavior
      event.preventDefault();

      // Add the class for cursor feedback
      this.renderer.addClass(this.graphContainer.nativeElement, 'isPanning');

      // Trigger change detection once to apply the isPanning class immediately
      this.cdr.detectChanges();
    }
  }

  // Listen globally for mouse up to stop panning
  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (this.isPanning) {
      this.isPanning = false;

      // Remove 'isPanning' class
      this.renderer.removeClass(this.graphContainer.nativeElement, 'isPanning');

      // Trigger change detection to update the class binding
      this.cdr.detectChanges();
    }
  }

  // Listen globally for the wheel event
  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    event.preventDefault(); // Stop page scroll

    const zoomSpeed = 0.1;
    // Determine zoom direction and calculate change
    const delta = event.deltaY > 0 ? -zoomSpeed : zoomSpeed;
    // Clamp scale between 0.1 and 5 (or desired range)
    const newScale = Math.max(0.1, Math.min(5, this.scale + delta));

    if (newScale !== this.scale) {
      // The mouse position (offsetX/Y) is relative to the SVG container.
      const mouseX = event.offsetX;
      const mouseY = event.offsetY;

      // Calculate the ratio for the pinch-to-zoom effect
      const ratio = newScale / this.scale;

      // Update pan to keep the point under the mouse stationary (Pinch-to-Zoom logic)
      this.translateX = mouseX - ratio * (mouseX - this.translateX);
      this.translateY = mouseY - ratio * (mouseY - this.translateY);

      this.scale = newScale;

      // Manually trigger change detection after zoom calculation
      this.cdr.detectChanges();
    }
  }
}
