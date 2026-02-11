import { Injectable, OnInit, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { MarkerData } from '../data-types/marker-data';
import { OVASDK } from '../../../../../ova-angular-sdk/ova-sdk';

@Injectable()
export class TimeTagService implements OnInit, OnDestroy {
  readonly timeTags$ = new BehaviorSubject<MarkerData[]>([]);
  private videoId: string = '';
  private ovaSdk = inject(OVASDK);

  /** Cleanup subject used for unsubscription */
  private readonly destroy$ = new Subject<void>();

  init(videoId: string): void {
    this.videoId = videoId;
    this.fetch();
  }

  fetch() {
    if (this.videoId == '') return;
    this.ovaSdk.marker.getMarkers(this.videoId).subscribe((response) => {
      if (response.status === 'success') {
        const markers: MarkerData[] = Array.isArray(response.data?.markers)
          ? response.data.markers
          : [];

        this.timeTags$.next(
          markers.sort((a, b) => a.timeSecond - b.timeSecond),
        );
      }
    });
  }

  addTimeTag(time: number, label: string) {
    const finalLabel =
      label && label.trim().length > 0 ? label.trim() : `TimeTag at ${time}`;
    const finalDescription = 'No description';

    this.ovaSdk.marker
      .addMarker(this.videoId, {
        timeSecond: Math.trunc(time),
        label: finalLabel,
        description: finalDescription,
      })
      .subscribe((response) => {
        if (response.status === 'success') {
          // refresh markers after creating
          this.fetch();
        }
      });
  }

  ngOnInit(): void {}

  /** Clean up subscriptions when the service is destroyed */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.timeTags$.complete();
  }
}
