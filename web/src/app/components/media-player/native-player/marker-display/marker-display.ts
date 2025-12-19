// src/app/components/media-player/native-player/marker-display/marker-display.ts
import {
  Component,
  Input,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { formatTime } from '../utils/time-utils';
import { VideoData } from '../../../../../ova-angular-sdk/core-types/video-data';
import { MarkerApiService } from '../../../../../ova-angular-sdk/rest-api/marker-api.service';
import { MarkerData } from '../data-types/marker-data';
import { MarkerCreatorModal } from '../marker-creator-modal/marker-creator-modal';

@Component({
  selector: 'app-marker-display',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkerCreatorModal],
  templateUrl: './marker-display.html',
})
export class MarkerDisplay implements OnInit {
  @Input() videoData!: VideoData;
  @Input({ required: true }) videoRef!: ElementRef<HTMLVideoElement>;

  markers: MarkerData[] = [];

  formatTime = formatTime;
  private markerApi = inject(MarkerApiService);

  // Toggle state for the dropdown/menu
  isOpen = false;

  @ViewChild('markerCreatorModal') markerCreator!: MarkerCreatorModal;

  ngOnInit() {
    this.fetchMarkers();
  }

  // Toggle via button click
  toggle(event: Event) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  fetchMarkers() {
    this.markerApi.getMarkers(this.videoData.videoId).subscribe((response) => {
      if (response.status === 'success') {
        this.markers = response.data.markers;
      }
    });
  }

  // Add marker optionally using provided label/description
  addMarker(time?: number, label?: string, description?: string) {
    const currentTime = time ?? this.videoRef.nativeElement.currentTime;
    const finalLabel =
      label && label.trim().length > 0
        ? label.trim()
        : `Marker at ${this.formatTime(currentTime)}`;
    const finalDescription =
      description && description.trim().length > 0
        ? description.trim()
        : 'No description';

    this.markerApi
      .addMarker(this.videoData.videoId, {
        timeSecond: Math.trunc(currentTime),
        label: finalLabel,
        description: finalDescription,
      })
      .subscribe((response) => {
        if (response.status === 'success') {
          // refresh markers after creating
          this.fetchMarkers();
        }
      });
  }

  openMarkerCreator() {
    this.markerCreator.open();
  }

  onMarkerCreated(payload: { label: string; description: string }) {
    this.addMarker(undefined, payload.label, payload.description);
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
