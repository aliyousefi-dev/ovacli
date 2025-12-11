import {
  Component,
  Input,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-track',
  standalone: true,
  templateUrl: './progress-track.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressTrack implements OnInit, OnDestroy {
  @Input({ required: true }) videoRef!: ElementRef<HTMLVideoElement>;

  @ViewChild('progress') progressRef!: ElementRef<HTMLDivElement>;
  @ViewChild('pivot') pivotRef!: ElementRef<HTMLDivElement>;
  @ViewChild('trackContainer') trackContainerRef!: ElementRef<HTMLDivElement>;

  @Output() scrubMove = new EventEmitter<{ time: number; xPercent: number }>();
  @Output() scrubEnd = new EventEmitter<void>();

  @Output() mouseHover = new EventEmitter<{ time: number; xPercent: number }>();

  @Output() mouseLeave = new EventEmitter<void>();

  private video!: HTMLVideoElement;
  private isDragging: boolean = false;
  private pendingSeekTime: number | null = null;
  private wasPlayingBeforeDrag: boolean = false;

  ngOnInit() {
    if (this.videoRef && this.videoRef.nativeElement) {
      this.video = this.videoRef.nativeElement;

      this.video.addEventListener('timeupdate', this.updateProgress); // --- Global Mouse Handlers ---

      window.addEventListener('mousemove', this.onDrag);
      window.addEventListener('mouseup', this.stopDrag); // --- Global Touch Handlers (NEW) --- // { passive: false } is essential to allow preventDefault() inside onTouchMove

      window.addEventListener('touchmove', this.onTouchMove, {
        passive: false,
      });
      window.addEventListener('touchend', this.stopDrag); // Uses stopDrag for cleanup
    }
  }

  ngOnDestroy() {
    if (this.video) {
      this.video.removeEventListener('timeupdate', this.updateProgress);
    } // --- Cleanup Global Mouse Handlers ---

    window.removeEventListener('mousemove', this.onDrag);
    window.removeEventListener('mouseup', this.stopDrag); // --- Cleanup Global Touch Handlers ---

    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.stopDrag);
  }
  /**
   * Calculates the video playback percentage and updates the bar width and pivot position.
   */

  private updateProgress = () => {
    // Only update based on timeupdate if we are NOT currently dragging
    if (this.isDragging) {
      return;
    }

    if (
      this.video &&
      this.progressRef &&
      this.pivotRef &&
      isFinite(this.video.duration)
    ) {
      const video = this.video;
      const pct = (video.currentTime / video.duration) * 100;

      this.progressRef.nativeElement.style.width = pct + '%';
      this.pivotRef.nativeElement.style.left = pct + '%';
    }
  };
  /**
   * Calculates the new time and its position percentage based on a clientX position.
   */

  private calculateTimeAndPosition(
    clientX: number
  ): { time: number; xPercent: number; clientX: number } | null {
    if (
      !this.video ||
      !this.trackContainerRef ||
      !isFinite(this.video.duration)
    ) {
      return null;
    }

    const rect = this.trackContainerRef.nativeElement.getBoundingClientRect(); // Calculate percentage (0 to 1)

    const percent = Math.max(
      0,
      Math.min(1, (clientX - rect.left) / rect.width)
    );

    const newTime = percent * this.video.duration; // Return time in seconds and position as a percentage (0 to 100)

    return { time: newTime, xPercent: percent * 100, clientX: clientX };
  }

  public seekToTime(timeInSeconds: number): void {
    if (!this.video || !isFinite(this.video.duration)) {
      console.warn('Cannot seek: video element or duration is unavailable.');
      return;
    } // 1. Clamp the time to be within the video duration (0 to duration)

    const clampedTime = Math.max(
      0,
      Math.min(timeInSeconds, this.video.duration)
    ); // 2. Apply the time to the video element

    this.video.currentTime = clampedTime; // 3. Manually update the UI (since 'timeupdate' is asynchronous) // Calculate the percentage based on the new time

    const pct = (clampedTime / this.video.duration) * 100; // Update the visual position immediately

    if (this.progressRef && this.pivotRef) {
      this.progressRef.nativeElement.style.width = pct + '%';
      this.pivotRef.nativeElement.style.left = pct + '%';
    }
  }
  /**
   * Calculates and sets the UI position. Optionally updates the video time immediately or stores it.
   */

  private seekTo(clientX: number, updateVideoTime: boolean): number | null {
    const data = this.calculateTimeAndPosition(clientX);

    if (!data) {
      return null;
    }

    const { time: newTime, xPercent: pct } = data;

    if (updateVideoTime) {
      // Update video time directly on click/release
      this.video.currentTime = newTime;
      this.pendingSeekTime = null;
    } else {
      // Store the time while dragging for later update
      this.pendingSeekTime = newTime;
    } // Manually update the progress bar and pivot position (ALWAYS update the UI)

    this.progressRef.nativeElement.style.width = pct + '%';
    this.pivotRef.nativeElement.style.left = pct + '%';

    return newTime;
  } // --- Utility to get clientX for both Mouse and Touch events ---

  private getClientX(event: MouseEvent | TouchEvent): number | null {
    if (event instanceof MouseEvent) {
      return event.clientX;
    } else if (event.touches && event.touches.length > 0) {
      return event.touches[0].clientX;
    }
    return null;
  } // --- Drag/Scrub Operations ---

  private startDragOperation(clientX: number): void {
    if (this.isDragging) return; // Pause the video and record playback state

    this.wasPlayingBeforeDrag = !this.video.paused;
    this.video.pause();

    this.isDragging = true; // Initial UI update only (move pivot to cursor position)

    this.seekTo(clientX, false);
  }
  /**
   * Handler for mousedown/touchstart on the pivot element.
   */

  startDrag = (event: MouseEvent | TouchEvent): void => {
    // Prevents the track mousedown/touchstart handler from also firing
    event.stopPropagation();
    const clientX = this.getClientX(event);
    if (clientX !== null) {
      this.startDragOperation(clientX);
    }
  };
  /**
   * Handles mouse or touch movement while dragging (bound globally).
   */

  onDrag = (event: MouseEvent): void => {
    if (!this.isDragging) {
      return;
    } // Use the mouse event clientX for mouse drag
    event.preventDefault();
    this.handleScrubMove(event.clientX);
  };
  /**
   * Handles touch movement while dragging (bound globally).
   */

  onTouchMove = (event: TouchEvent): void => {
    if (!this.isDragging) {
      return;
    } // Crucial to prevent scrolling/default touch behavior
    event.preventDefault();

    const clientX = this.getClientX(event);
    if (clientX !== null) {
      this.handleScrubMove(clientX);
    }
  };
  /**
   * Core logic to update UI during a drag and emit scrubMove.
   */

  private handleScrubMove(clientX: number): void {
    // Update the UI via seekTo (updateVideoTime: false)
    this.seekTo(clientX, false); // Get the calculated time and position to emit

    const data = this.calculateTimeAndPosition(clientX); // EMIT SCRUB MOVE with the time and xPercent

    if (data !== null) {
      // Include a clientX value (absolute window X) to the emitted event for accurate pixel-based behavior
      this.scrubMove.emit(data);
    }
  }
  /**
   * Stops the drag operation and updates the video's currentTime (bound globally).
   */

  stopDrag = (): void => {
    if (!this.isDragging) return;

    if (this.pendingSeekTime !== null) {
      // Final update: Update video's currentTime only on 'mouseup'/'touchend'
      this.video.currentTime = this.pendingSeekTime;
    } // Resume video if it was playing before drag started

    if (this.wasPlayingBeforeDrag) {
      this.video.play();
    }

    this.isDragging = false;
    this.pendingSeekTime = null; // Reset
    this.wasPlayingBeforeDrag = false; // Reset // EMIT SCRUB END

    this.scrubEnd.emit();
  }; // --- Mousedown/Touchstart Handler (for track area) ---
  /**
   * Handles mousedown or touchstart events on the track.
   */

  onTrackStart(event: MouseEvent | TouchEvent): void {
    // Prevent double-handling if the event started on the pivot itself
    if (event.target === this.pivotRef.nativeElement) {
      return;
    } // Prevent default touch behavior (scrolling) for track initiation

    if (event instanceof TouchEvent) {
      event.preventDefault();
    }

    const clientX = this.getClientX(event);
    if (clientX !== null) {
      this.startDragOperation(clientX);
    }
  } // --- Hover/Preview Handlers ---
  /**
   * Handler for mousemove/touchmove on the track container (non-dragging)
   */

  onTrackMouseMove(event: MouseEvent | TouchEvent): void {
    // We only emit the hover event if we are NOT currently dragging
    if (!this.isDragging) {
      const clientX = this.getClientX(event);
      if (clientX !== null) {
        const data = this.calculateTimeAndPosition(clientX);
        if (data !== null) {
          this.mouseHover.emit(data);
        }
      }
    }
  }
  /**
   * Handler for mouseleave on the track container (non-dragging).
   */

  onTrackMouseLeave(): void {
    // Only emit the leave event if we are NOT currently dragging
    if (!this.isDragging) {
      this.mouseLeave.emit();
    }
  }
}
