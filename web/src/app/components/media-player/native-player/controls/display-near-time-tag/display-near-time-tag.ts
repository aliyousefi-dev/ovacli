import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ScrubService } from '../../services/scrub.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-display-near-time-tag',
  standalone: true,
  templateUrl: './display-near-time-tag.html',
  imports: [CommonModule],
})
export class DisplayNearTimeTag implements OnInit, OnDestroy {
  /** Service that emits the current time‑tag */
  private readonly scrubPlayer = inject(ScrubService);

  /** The text that will be shown */
  public timeTagLabel = '';
  fadeTimeout: any;

  /** Flag that controls the Tailwind opacity classes */
  public show = false;

  /** How long the tag should stay visible (ms) */
  private readonly VISIBLE_TIME = 1200; // adjust to your liking

  private sub: any; // we’ll unsubscribe in ngOnDestroy

  ngOnInit(): void {
    this.sub = this.scrubPlayer.nearTimeTagLableBasedCurrentTime$.subscribe(
      (label: string) => {
        if (!label) {
          // nothing to show → just hide
          this.hideTag();
          return;
        }

        this.timeTagLabel = label;
        this.show = true; // trigger fade‑in

        clearTimeout(this.fadeTimeout);
        // After the visible window, fade it out
        this.fadeTimeout = setTimeout(
          () => (this.show = false),
          this.VISIBLE_TIME,
        );
      },
    );
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  /** Convenience – hide immediately */
  private hideTag() {
    this.show = false;
  }
}
