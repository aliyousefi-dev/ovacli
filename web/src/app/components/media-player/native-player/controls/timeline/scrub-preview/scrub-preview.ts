import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrubImageComponent } from '../scrub-image/scrub-image';
import { ScrubTimelineService } from '../../../services/scrub-timeline.service';
import { formatTime } from '../../../utils/time-utils';

@Component({
  selector: 'app-scrub-preview',
  standalone: true,
  templateUrl: './scrub-preview.html',
  imports: [CommonModule, ScrubImageComponent],
})
export class ScrubPreview implements OnInit, OnChanges {
  scrubTimeline = inject(ScrubTimelineService);

  seekTime: string = formatTime(0);

  ngOnInit(): void {
    this.scrubTimeline.seekTime$.subscribe((time) => {
      this.seekTime = formatTime(time);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {}
}
