import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

/**
 * Defines the contract for events emitted by the host directive.
 */
export interface PlayerHostEvents {
  playPauseToggle: void;
  hideControls: void;
  showControls: void; // Events for seeking
  stepForward: void; // For seeking forward (e.g., 5 seconds)
  stepBackward: void; // For seeking backward (e.g., 5 seconds) // New Events for volume control
  volumeUp: void;
  volumeDown: void;
}

@Directive({
  selector: '[appPlayerControlsHost]', // Attribute selector used in the HTML
  standalone: true,
})
export class PlayerInputHostDirective {
  // Event emitter to communicate mouse/keyboard events back to the component
  @Output() inputEvents = new EventEmitter<keyof PlayerHostEvents>(); // --- Activity Listeners (Player Area) --- // When the mouse enters, moves, or a touch occurs, signal the component to show controls. // Note: Touch events like 'touchstart' and 'touchmove' don't require an explicit 'mouseleave' // counterpart; the component handles hiding after a timeout.

  @HostListener('mouseenter')
  @HostListener('mousemove')
  @HostListener('touchstart') // 🟢 NEW: Touch starts to show controls
  @HostListener('touchmove') // 🟢 NEW: Touch move to keep controls visible
  onUserActivity() {
    this.inputEvents.emit('showControls');
  } // --- Mouse Leave Listener (Player Area) --- // When the mouse leaves, signal the component to hide controls immediately (standard desktop behavior)

  @HostListener('mouseleave')
  onMouseLeave() {
    this.inputEvents.emit('hideControls');
  } // --- Keyboard Listener (Document Level) ---

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    const isTyping =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable; // We only want to process media controls if the user is NOT actively typing

    if (isTyping) {
      return;
    } // Spacebar to toggle Play/Pause

    if (event.key === ' ') {
      event.preventDefault(); // Prevent the spacebar from scrolling the page
      this.inputEvents.emit('playPauseToggle');
      return;
    } // Escape key to hide controls

    if (event.key === 'Escape') {
      this.inputEvents.emit('hideControls');
      return;
    } // Arrow Keys for seeking forward/backward

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.inputEvents.emit('stepForward');
      return;
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.inputEvents.emit('stepBackward');
      return;
    } // Arrow Keys for Volume Up/Down

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.inputEvents.emit('volumeUp');
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.inputEvents.emit('volumeDown');
    }
  }
}
