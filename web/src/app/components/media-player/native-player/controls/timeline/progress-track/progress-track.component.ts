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
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrubTimelineService } from '../../../services/scrub-timeline.service';
import { PlayerStateService } from '../../../services/player-state.service';

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
  @ViewChild('playHeadCircle') playHeadCircleRef!: ElementRef<HTMLDivElement>;
  @ViewChild('trackContainer') trackContainerRef!: ElementRef<HTMLDivElement>;

  @Output() scrubMove = new EventEmitter<{ time: number; xPercent: number }>();
  @Output() scrubEnd = new EventEmitter<void>();

  @Output() mouseHover = new EventEmitter<{ time: number; xPercent: number }>();

  @Output() mouseLeave = new EventEmitter<void>();

  private video!: HTMLVideoElement;
  private isDragging: boolean = false;
  private pendingSeekTime: number | null = null;
  private wasPlayingBeforeDrag: boolean = false;

  private scrubTimeline = inject(ScrubTimelineService);
  private playerState = inject(PlayerStateService);

  ngOnInit() {
    this.playerState.currentTime$.subscribe((t) => {
      this.updateProgress();
    });

    if (this.videoRef && this.videoRef.nativeElement) {
      this.video = this.videoRef.nativeElement;

      window.addEventListener('mousemove', this.onDrag);
      window.addEventListener('mouseup', this.stopDrag); // --- Global Touch Handlers (NEW) --- // { passive: false } is essential to allow preventDefault() inside onTouchMove

      window.addEventListener('touchmove', this.onTouchMove, {
        passive: false,
      });
      window.addEventListener('touchend', this.stopDrag); // Uses stopDrag for cleanup
    }
  }

  ngOnDestroy() {
    window.removeEventListener('mousemove', this.onDrag);
    window.removeEventListener('mouseup', this.stopDrag); // --- Cleanup Global Touch Handlers ---

    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.stopDrag);
  }

  private updateProgress = () => {
    // Only update based on timeupdate if we are NOT currently dragging
    if (this.isDragging) {
      return;
    }

    if (
      this.video &&
      this.progressRef &&
      this.playHeadCircleRef &&
      isFinite(this.video.duration)
    ) {
      const video = this.video;
      const pct = (video.currentTime / video.duration) * 100;

      this.progressRef.nativeElement.style.width = pct + '%';
      this.playHeadCircleRef.nativeElement.style.left = pct + '%';
    }
  };

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

    this.playerState.seekToTime(clampedTime);

    const pct = (clampedTime / this.video.duration) * 100; // Update the visual position immediately

    if (this.progressRef && this.playHeadCircleRef) {
      this.progressRef.nativeElement.style.width = pct + '%';
      this.playHeadCircleRef.nativeElement.style.left = pct + '%';
    }
  }

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
    this.playHeadCircleRef.nativeElement.style.left = pct + '%';

    return newTime;
  }

  private getClientX(event: MouseEvent | TouchEvent): number | null {
    if (event instanceof MouseEvent) {
      return event.clientX;
    } else if (event.touches && event.touches.length > 0) {
      return event.touches[0].clientX;
    }
    return null;
  }

  private startDragOperation(clientX: number): void {
    if (this.isDragging) return; // Pause the video and record playback state

    this.wasPlayingBeforeDrag = !this.video.paused;
    this.video.pause();

    this.isDragging = true; // Initial UI update only (move pivot to cursor position)

    this.seekTo(clientX, false);
  }

  playheadCircleDragStart = (event: MouseEvent | TouchEvent): void => {
    // Prevents the track mousedown/touchstart handler from also firing
    event.stopPropagation();
    this.scrubTimeline.setScrubVisibility(true);

    const clientX = this.getClientX(event);
    if (clientX !== null) {
      this.startDragOperation(clientX);
    }
  };

  onDrag = (event: MouseEvent): void => {
    if (!this.isDragging) {
      return;
    } // Use the mouse event clientX for mouse drag
    event.preventDefault();
    this.handleScrubMove(event.clientX);
  };

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

  onTrackStart(event: MouseEvent | TouchEvent): void {
    // Prevent double-handling if the event started on the pivot itself
    if (event.target === this.playHeadCircleRef.nativeElement) {
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

  onTrackMouseLeave(): void {
    // Only emit the leave event if we are NOT currently dragging
    if (!this.isDragging) {
      this.mouseLeave.emit();
    }
  }
}
