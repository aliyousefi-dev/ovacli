import { Directive, HostListener, inject } from '@angular/core';
import { PlayerStateService } from '../services/player-state.service';
import { PlayerUIService } from '../services/player-ui.service';

@Directive({
  selector: '[appPlayerControlsHost]', // Attribute selector used in the HTML
  standalone: true,
})
export class PlayerInputHostDirective {
  private playerState = inject(PlayerStateService);
  private playerUIService = inject(PlayerUIService);
  private volumeDefultStep = 0.01;
  private volumeDefultShiftStep = 0.05;

  @HostListener('mouseenter')
  @HostListener('mousemove')
  @HostListener('touchstart')
  @HostListener('touchmove')
  onUserActivity() {
    this.playerUIService.triggerUIControlsVisibility();
  }

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
      this.playerState.togglePlay();
      return;
    } // Escape key to hide controls

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.playerState.stepForward();
      return;
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.playerState.stepBackward();
      return;
    } // Arrow Keys for Volume Up/Down

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (event.shiftKey) {
        this.playerState.setVolume(
          this.playerState.volume$.value + this.volumeDefultShiftStep,
        );
      } else {
        this.playerState.setVolume(
          this.playerState.volume$.value + this.volumeDefultStep,
        );
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (event.shiftKey) {
        this.playerState.setVolume(
          this.playerState.volume$.value - this.volumeDefultShiftStep,
        );
      } else {
        this.playerState.setVolume(
          this.playerState.volume$.value - this.volumeDefultStep,
        );
      }
    }
  }
}
