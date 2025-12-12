// src/app/components/media-player/native-player/controls/display-current-time/display-current-time.component.ts
import { Component, Input, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { formatTime } from '../utils/time-utils';
import { VideoData } from '../../../../../ova-angular-sdk/core-types/video-data';

@Component({
  selector: 'app-marker-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './marker-display.html',
})
export class MarkerDisplay {
  @Input() videoData!: VideoData;
  @Input({ required: true }) videoRef!: ElementRef<HTMLVideoElement>;

  formatTime = formatTime;

  // Toggle state for the dropdown/menu
  isOpen = false;

  // Toggle via button click
  toggle(event: Event) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  // Select a marker (emit time and close menu)
  selectMarker(marker: any) {
    this.videoRef.nativeElement.currentTime = marker.timeSecond;
    this.isOpen = false;
  }

  // Close when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  constructor(private elRef: ElementRef) {}
}
