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
import { formatTime } from '../../utils/time-utils';
import { MarkerData } from '../../data-types/marker-data';
import { MarkerCreatorModal } from '../marker-creator-modal/marker-creator-modal';
import { PlayerUIService } from '../../services/player-ui.service';
import { PlayerStateService } from '../../services/player-state.service';
import { TimeTagService } from '../../services/time-tag.service';

@Component({
  selector: 'app-marker-display',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkerCreatorModal],
  templateUrl: './marker-display.html',
})
export class MarkerDisplay implements OnInit {
  markers: MarkerData[] = [];

  formatTime = formatTime;
  private playerUI = inject(PlayerUIService);
  private playerState = inject(PlayerStateService);
  private timeTagService = inject(TimeTagService);

  // Toggle state for the dropdown/menu
  isOpen = false;
  tagTimeEnabled: boolean = false;

  @ViewChild('markerCreatorModal') markerCreator!: MarkerCreatorModal;

  ngOnInit() {
    this.playerUI.tagTimeMenuVisible$.subscribe((e) => {
      this.tagTimeEnabled = e;
    });

    this.timeTagService.timeTags$.subscribe((data) => {
      this.markers = data;
    });
  }

  // Add marker optionally using provided label/description
  addMarker(time?: number, label?: string, description?: string) {
    const currentTime = time ?? Math.trunc(this.playerState.currentTime$.value);
    const finalLabel =
      label && label.trim().length > 0
        ? label.trim()
        : `Marker at ${this.formatTime(currentTime)}`;

    this.timeTagService.addTimeTag(currentTime, finalLabel);
  }

  openMarkerCreator() {
    this.markerCreator.open();
  }

  onMarkerCreated(payload: { label: string; description: string }) {
    this.addMarker(undefined, payload.label, payload.description);
  }

  // Select a marker (emit time and close menu)
  selectMarker(marker: any) {
    this.playerState.seekToTime(marker.timeSecond);
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
