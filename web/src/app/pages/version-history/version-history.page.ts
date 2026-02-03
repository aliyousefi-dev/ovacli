import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VideoData } from '../../../ova-angular-sdk/core-types/video-data';
import { VidstackPlayerComponent } from '../../components/media-player/vidstack-player/vidstack-player.component';
import { OVASDK } from '../../../ova-angular-sdk/ova-sdk';

@Component({
  selector: 'app-version-history',
  standalone: true,
  imports: [CommonModule, FormsModule, VidstackPlayerComponent],
  templateUrl: './version-history.page.html',
})
export class VersionHistoryPage implements OnInit {
  videoId: string | null = null; // Declare the videoId variable
  videodata!: VideoData;

  private ovaSdk = inject(OVASDK);

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Access the videoId from the route parameter
    this.videoId = this.route.snapshot.paramMap.get('videoId');
    console.log(this.videoId);
    if (this.videoId) {
      this.fetchVideo(this.videoId);
    }
  }

  fetchVideo(videoId: string) {
    this.ovaSdk.videos.getVideoById(videoId).subscribe({
      next: (response) => {
        this.videodata = response.data;
      },
    });
  }
}
