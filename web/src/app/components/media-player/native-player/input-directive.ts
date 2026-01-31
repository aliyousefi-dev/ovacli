import { Directive, HostListener, inject } from '@angular/core';
import { StateService } from './services/state.service';
import { InteractionService } from './services/interaction.service';

@Directive({
  selector: '[appPlayerControlsHost]', // Attribute selector used in the HTML
  standalone: true,
})
export class PlayerInputHostDirective {
  private stateService = inject(StateService);
  private interactionService = inject(InteractionService);
  private volumeDefultStep = 0.01;
  private volumeDefultShiftStep = 0.05;

  @HostListener('mouseenter')
  @HostListener('mousemove')
  @HostListener('touchstart')
  @HostListener('touchmove')
  onUserActivity() {
    this.interactionService.triggerUIControlsVisibility();
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
      this.stateService.togglePlay();
      this.interactionService.triggerUIControlsVisibility();
      return;
    } // Escape key to hide controls

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.interactionService.triggerUIControlsVisibility();
      if (event.shiftKey) {
        this.stateService.shiftStepForward();
      } else {
        this.stateService.stepForward();
      }
      return;
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.interactionService.triggerUIControlsVisibility();
      if (event.shiftKey) {
        this.stateService.shiftStepBackward();
      } else {
        this.stateService.stepBackward();
      }
      return;
    } // Arrow Keys for Volume Up/Down

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.interactionService.triggerUIControlsVisibility();
      if (event.shiftKey) {
        this.stateService.setVolume(
          this.stateService.volume$.value + this.volumeDefultShiftStep,
        );
      } else {
        this.stateService.setVolume(
          this.stateService.volume$.value + this.volumeDefultStep,
        );
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.interactionService.triggerUIControlsVisibility();
      if (event.shiftKey) {
        this.stateService.setVolume(
          this.stateService.volume$.value - this.volumeDefultShiftStep,
        );
      } else {
        this.stateService.setVolume(
          this.stateService.volume$.value - this.volumeDefultStep,
        );
      }
    }
  }
}
