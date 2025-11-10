import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoApiService } from '../../../../services/ova-backend-service/video-api.service';
import { VideoData } from '../../../../services/ova-backend-service/api-types/video-data';

@Component({
  selector: 'app-default-video-player',
  standalone: true,
  templateUrl: './default-video-player.component.html',
  imports: [CommonModule],
})
export class DefaultVideoPlayerComponent implements AfterViewInit, OnDestroy {
  @Input() videoData!: VideoData;

  @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('thumbPreview') thumbPreview!: ElementRef<HTMLDivElement>;
  @ViewChild('timeline') timeline!: ElementRef<HTMLDivElement>;
  @ViewChild('progress') progress!: ElementRef<HTMLDivElement>;

  private videoapi = inject(VideoApiService);
  private cues: any[] = [];

  get videoUrl() {
    return this.videoapi.getStreamUrl(this.videoData.videoId);
  }

  get scrubThumbsUrl() {
    return this.videoapi.getPreviewThumbsUrl(this.videoData.videoId);
  }

  get thumbnailUrl() {
    return this.videoapi.getThumbnailUrl(this.videoData.videoId);
  }

  async ngAfterViewInit() {
    await this.loadScrubThumbnails(this.scrubThumbsUrl);

    const video = this.videoRef.nativeElement;

    // Update progress bar while video plays
    video.addEventListener('timeupdate', () => {
      const pct = (video.currentTime / video.duration) * 100;
      this.progress.nativeElement.style.width = pct + '%';
    });

    // Hover events on timeline
    this.timeline.nativeElement.addEventListener('mousemove', this.showPreview);
    this.timeline.nativeElement.addEventListener(
      'mouseleave',
      this.hidePreview
    );
  }

  ngOnDestroy() {
    this.timeline.nativeElement.removeEventListener(
      'mousemove',
      this.showPreview
    );
    this.timeline.nativeElement.removeEventListener(
      'mouseleave',
      this.hidePreview
    );
  }

  private async loadScrubThumbnails(url: string) {
    const vtt = await fetch(url).then((r) => r.text());
    const blocks = vtt.split('\n\n');

    for (const block of blocks) {
      const lines = block.split('\n');
      if (lines.length < 2) continue;

      const [start, end] = lines[0].split(' --> ').map(this.timeToSeconds);
      const [urlBase, coords] = lines[1].split('#xywh=');
      const [x, y, w, h] = coords.split(',').map(Number);

      this.cues.push({ start, end, url: urlBase, x, y, w, h });
    }
  }

  private timeToSeconds(ts: string) {
    const [h, m, s] = ts.split(':').map(Number);
    return h * 3600 + m * 60 + s;
  }

  showPreview = (event: MouseEvent) => {
    const video = this.videoRef.nativeElement;
    const preview = this.thumbPreview.nativeElement;
    const rect = this.timeline.nativeElement.getBoundingClientRect();

    const percent = (event.clientX - rect.left) / rect.width;
    const time = percent * video.duration;

    const cue = this.cues.find((c) => time >= c.start && time < c.end);
    if (!cue) return;

    preview.style.opacity = '1';

    // Position above timeline
    const xPos = event.clientX - rect.left - cue.w / 2;
    preview.style.left = `${xPos}px`;
    preview.style.top = `-${cue.h + 10}px`;

    // Set background image and crop to xywh
    preview.style.backgroundImage = `url(${cue.url})`;
    preview.style.width = `${cue.w}px`;
    preview.style.height = `${cue.h}px`;
    preview.style.backgroundPosition = `-${cue.x}px -${cue.y}px`;
    preview.style.backgroundSize = 'auto'; // important, don't stretch
  };

  hidePreview = () => {
    this.thumbPreview.nativeElement.style.opacity = '0';
  };
}
