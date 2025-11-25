import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

export interface NodeEditorHostEvents {
  Pan: { deltaX: number; deltaY: number };
  ZoomInOut: { delta: number };
  OpenContextMenu: void;
  FocusNode: void;
  OnPointerDown: { x: number; y: number };
  DuplicateNode: void; // <-- NEW: Event for Ctrl + D
}

@Directive({
  selector: '[appNodeEditorHost]',
  standalone: true,
})
export class NodeEditorInputDirective {
  @Output() hostEvents = new EventEmitter<
    | keyof NodeEditorHostEvents
    | { Pan: NodeEditorHostEvents['Pan'] }
    | { ZoomInOut: NodeEditorHostEvents['ZoomInOut'] }
    | { OnPointerDown: NodeEditorHostEvents['OnPointerDown'] }
    | { DuplicateNode: NodeEditorHostEvents['DuplicateNode'] } // <-- NEW: Added to output type
  >();

  private lastMouseX: number | undefined;
  private lastMouseY: number | undefined;
  private isPanning: boolean = false;

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    // 1. Left Mouse Button (button 0): Emit OnPointerDown
    if (event.button === 0) {
      this.hostEvents.emit({
        OnPointerDown: { x: event.clientX, y: event.clientY },
      });
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
    } // 2. Middle Mouse Button (button 1): Start panning
    else if (event.button === 1) {
      event.preventDefault();
      this.isPanning = true;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
    } // 3. Right Mouse Button (button 2): Capture coordinates for context menu
    else if (event.button === 2) {
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
    }
  }

  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: MouseEvent) {
    event.preventDefault();
    this.hostEvents.emit('OpenContextMenu');
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (
      this.isPanning &&
      this.lastMouseX !== undefined &&
      this.lastMouseY !== undefined
    ) {
      const deltaX = event.clientX - this.lastMouseX;
      const deltaY = event.clientY - this.lastMouseY;

      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;

      this.hostEvents.emit({ Pan: { deltaX, deltaY } });
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    if (this.isPanning) {
      this.isPanning = false;
    }
    this.lastMouseX = undefined;
    this.lastMouseY = undefined;
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    event.preventDefault();

    this.hostEvents.emit({ ZoomInOut: { delta: event.deltaY } });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    const isTyping =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable;

    if (isTyping) {
      return;
    }

    // Ctrl/Cmd + D for Duplicate Node
    const isControlOrCommand = event.ctrlKey || event.metaKey; // metaKey is Cmd on Mac
    if (isControlOrCommand && (event.key === 'd' || event.key === 'D')) {
      event.preventDefault();
      this.hostEvents.emit('DuplicateNode');
      return;
    }

    // Shift + A to open context menu
    if (event.shiftKey && (event.key === 'a' || event.key === 'A')) {
      event.preventDefault();
      this.hostEvents.emit('OpenContextMenu');
      return;
    }

    // F to focus node
    if (event.key === 'f' || event.key === 'F') {
      event.preventDefault();
      this.hostEvents.emit('FocusNode');
      return;
    }
  }
}
