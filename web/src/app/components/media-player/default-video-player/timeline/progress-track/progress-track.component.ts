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

  // 🟢 UPDATED OUTPUT: Emits the current time in seconds AND the position percentage 🟢
  @Output() scrubMove = new EventEmitter<{ time: number; xPercent: number }>();
  @Output() scrubEnd = new EventEmitter<void>();

  // 🟢 UPDATED OUTPUT: Emits the current time in seconds AND the position percentage 🟢
  @Output() mouseHover = new EventEmitter<{ time: number; xPercent: number }>();

  @Output() mouseLeave = new EventEmitter<void>();

  private video!: HTMLVideoElement;
  private isDragging: boolean = false;
  private pendingSeekTime: number | null = null;
  private wasPlayingBeforeDrag: boolean = false;

  ngOnInit() {
    if (this.videoRef && this.videoRef.nativeElement) {
      this.video = this.videoRef.nativeElement;

      this.video.addEventListener('timeupdate', this.updateProgress);

      window.addEventListener('mousemove', this.onDrag);
      window.addEventListener('mouseup', this.stopDrag);
    }
  }

  ngOnDestroy() {
    if (this.video) {
      this.video.removeEventListener('timeupdate', this.updateProgress);
    }
    window.removeEventListener('mousemove', this.onDrag);
    window.removeEventListener('mouseup', this.stopDrag);
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
   * 🟢 NEW METHOD: Calculates the new time and its position percentage based on mouse position.
   */
  private calculateTimeAndPosition(
    clientX: number
  ): { time: number; xPercent: number } | null {
    if (
      !this.video ||
      !this.trackContainerRef ||
      !isFinite(this.video.duration)
    ) {
      return null;
    }

    const rect = this.trackContainerRef.nativeElement.getBoundingClientRect();

    // Calculate percentage (0 to 1)
    const percent = Math.max(
      0,
      Math.min(1, (clientX - rect.left) / rect.width)
    );

    const newTime = percent * this.video.duration;

    // Return time in seconds and position as a percentage (0 to 100)
    return { time: newTime, xPercent: percent * 100 };
  }

  /**
   * 🟢 MODIFIED: Uses the new calculateTimeAndPosition and updates the UI.
   * Returns the calculated time in seconds.
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
    }

    // Manually update the progress bar and pivot position (ALWAYS update the UI)
    this.progressRef.nativeElement.style.width = pct + '%';
    this.pivotRef.nativeElement.style.left = pct + '%';

    return newTime;
  }
  // --- Dragging Handlers ---
  /**
   * Initiates the drag operation when the pivot is clicked (mousedown).
   */

  private startDragOperation(event: MouseEvent): void {
    if (this.isDragging) return;

    // Pause the video and record playback state
    this.wasPlayingBeforeDrag = !this.video.paused;
    this.video.pause();

    this.isDragging = true;

    // Initial UI update only (move pivot to cursor position)
    this.seekTo(event.clientX, false);
  }

  /**
   * Handler for mousedown on the pivot element.
   */

  startDrag = (event: MouseEvent): void => {
    // Prevents the track mousedown handler from also firing
    event.stopPropagation();
    this.startDragOperation(event);
  };

  /**
   * Handles mouse movement while dragging.
   */

  onDrag = (event: MouseEvent): void => {
    if (!this.isDragging) {
      return;
    }
    event.preventDefault(); // Prevent text selection/default browser behavior

    // Update the UI via seekTo (updateVideoTime: false)
    this.seekTo(event.clientX, false);

    // 🟢 MODIFIED: Get the calculated time and position to emit 🟢
    const data = this.calculateTimeAndPosition(event.clientX);

    // 🛑 EMIT SCRUB MOVE with the time and xPercent 🛑
    if (data !== null) {
      this.scrubMove.emit(data);
    }
  };

  /**
   * Stops the drag operation and updates the video's currentTime.
   */

  stopDrag = (): void => {
    if (this.isDragging && this.pendingSeekTime !== null) {
      // Final update: Update video's currentTime only on 'mouseup'
      this.video.currentTime = this.pendingSeekTime;
    }

    // Resume video if it was playing before drag started
    if (this.wasPlayingBeforeDrag) {
      this.video.play();
    }

    this.isDragging = false;
    this.pendingSeekTime = null; // Reset
    this.wasPlayingBeforeDrag = false; // Reset

    // 🛑 EMIT SCRUB END 🛑
    this.scrubEnd.emit();
  };

  // --- Mousedown Handler (for track area) ---
  /**
   * Handles mousedown events on the track.
   * @param event The mouse mousedown event.
   */

  onTrackMouseDown(event: MouseEvent): void {
    // Check if the event target is the pivot itself, to avoid double-handling
    if (event.target === this.pivotRef.nativeElement) {
      return;
    }
    this.startDragOperation(event);
  }

  /**
   * 🟢 MODIFIED: Handler for mousemove on the track container (non-dragging) 🟢
   */
  onTrackMouseMove(event: MouseEvent): void {
    // We only emit the hover event if we are NOT currently dragging
    if (!this.isDragging) {
      const data = this.calculateTimeAndPosition(event.clientX);
      if (data !== null) {
        this.mouseHover.emit(data);
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

  // 🛑 DELETED: The old calculateTime function is removed as it's replaced by calculateTimeAndPosition.
  // However, since `onTrackMouseMove` was calling it, we need to ensure it's still accessible, or
  // simply let it rely on `calculateTimeAndPosition` and extract the time.
  // For this update, I've simplified `onTrackMouseMove` to use `calculateTimeAndPosition` directly.
}
