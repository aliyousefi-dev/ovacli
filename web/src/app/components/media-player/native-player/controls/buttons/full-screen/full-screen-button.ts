// src/app/components/default-video-player/controls/full-screen-button/full-screen-button.component.ts

import { Component, Input, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-full-screen-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  // Assuming the template is full-screen-button.component.html or full-screen-button.html
  templateUrl: './full-screen-button.html',
})
export class FullScreenButton implements OnInit, OnDestroy {
  @Input({ required: true }) playerContainerRef!: ElementRef<HTMLElement>;

  isFullscreen: boolean = false;
  private destroy$ = new Subject<void>();

  ngOnInit() {
    // 1. Listen for the fullscreenchange event on the document to update the state
    fromEvent(document, 'fullscreenchange')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // `document.fullscreenElement` is non-null when in fullscreen mode
        this.isFullscreen = !!document.fullscreenElement;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Toggles the fullscreen state using the Fullscreen API.
   */
  toggleFullscreen() {
    const containerElement = this.playerContainerRef.nativeElement;

    if (this.isFullscreen) {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      // Note: vendor prefixes might be needed for older browsers (mozCancelFullScreen, webkitExitFullscreen, msExitFullscreen)
    } else {
      // Enter fullscreen
      if (containerElement.requestFullscreen) {
        containerElement.requestFullscreen();
      }
      // Note: vendor prefixes might be needed for older browsers (mozRequestFullScreen, webkitRequestFullscreen, msRequestFullscreen)
    }
  }
}
