import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrubImageComponent } from '../scrub-image/scrub-image';
import { ScrubPlayerService } from '../../../services/scrub-player.service';
import { formatTime } from '../../../utils/time-utils';

@Component({
  selector: 'app-scrub-preview',
  standalone: true,
  templateUrl: './scrub-preview.html',
  imports: [CommonModule, ScrubImageComponent],
})
export class ScrubPreview implements OnInit {
  scrubTimeline = inject(ScrubPlayerService);

  seekTime: string = formatTime(0);
  timeTagLabel: string = '';

  ngOnInit(): void {
    this.scrubTimeline.seekTime$.subscribe((time) => {
      this.seekTime = formatTime(time);
    });

    this.scrubTimeline.nearTimeTagLableBasedSeekTime$.subscribe((label) => {
      this.timeTagLabel = label;
    });
  }
}
