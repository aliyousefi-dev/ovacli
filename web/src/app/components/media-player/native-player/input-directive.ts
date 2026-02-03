import { Directive, HostListener, inject } from '@angular/core';
import { StateService } from './services/state.service';
import { InteractionService } from './services/interaction.service';
import { GlobalPlayerConfig } from './config';

@Directive({
  selector: '[appPlayerControlsHost]', // Attribute selector used in the HTML
  standalone: true,
})
export class PlayerInputHostDirective {
  private stateService = inject(StateService);
  private interactionService = inject(InteractionService);
  private configs = inject(GlobalPlayerConfig);

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

    if (event.key === 'm' || event.key === 'M') {
      event.preventDefault();
      this.interactionService.triggerUIControlsVisibility();
      this.stateService.toggleMute();
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.interactionService.triggerUIControlsVisibility();
      if (event.shiftKey) {
        this.stateService.shiftStepForward();
      } else if (event.ctrlKey) {
        this.stateService.stepForwardTimeTag();
      } else {
        this.stateService.stepForward();
      }
      return;
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.interactionService.triggerUIControlsVisibility();
      if (event.shiftKey) {
        this.stateService.shiftStepBackward();
      } else if (event.ctrlKey) {
        this.stateService.stepBackwardTimeTag();
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
          this.stateService.volume$.value + this.configs.SHIFT_VOLUME_STEP,
        );
      } else {
        this.stateService.setVolume(
          this.stateService.volume$.value + this.configs.VOLUME_STEP,
        );
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.interactionService.triggerUIControlsVisibility();
      if (event.shiftKey) {
        this.stateService.setVolume(
          this.stateService.volume$.value - this.configs.SHIFT_VOLUME_STEP,
        );
      } else {
        this.stateService.setVolume(
          this.stateService.volume$.value - this.configs.VOLUME_STEP,
        );
      }
    }
  }
}
