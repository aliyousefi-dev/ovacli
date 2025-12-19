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

  async toggleFullscreen() {
    const containerElement = this.playerContainerRef.nativeElement;

    if (this.isFullscreen) {
      if (document.exitFullscreen) {
        // Unlock orientation when exiting
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
        }
        await document.exitFullscreen();
      }
    } else {
      if (containerElement.requestFullscreen) {
        try {
          await containerElement.requestFullscreen();

          // ✨ New: Lock to landscape on mobile
          if (screen.orientation && (screen.orientation as any).lock) {
            // We use 'landscape' to cover both landscape-primary and landscape-secondary
            await (screen.orientation as any)
              .lock('landscape')
              .catch((err: any) => {
                console.log(
                  'Orientation lock failed or not supported on this device:',
                  err
                );
              });
          }
        } catch (err) {
          console.error('Error attempting to enable full-screen mode:', err);
        }
      }
    }
  }
}
