import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { GalleryPreview } from '../../components/gallery/gallery-preview/gallery-preview';
import { GalleryStateService } from '../../components/gallery/gallery-state.service';
import { GalleryFetchFn } from '../../components/gallery/types';

import { OVASDK } from '../../../ova-angular-sdk/ova-sdk';

import { map } from 'rxjs';

@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, GalleryPreview],
  templateUrl: './playlist-content.page.html',
  providers: [GalleryStateService],
})
export class PlaylistContentPage implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}
  playlistTitle = '';

  private ovaSdk = inject(OVASDK);
  private galleryState = inject(GalleryStateService);

  ngOnInit() {
    // Assuming playlist title is passed as route param 'title'
    this.route.paramMap.subscribe((params) => {
      const playlistId = params.get('playlistId');

      const fetchProxy: GalleryFetchFn = (page: number) => {
        // Ensure playlistId is not null before using it
        if (!playlistId) {
          throw new Error('playlistId param missing');
        }

        return this.ovaSdk.playlistContent
          .fetchPlaylistContent(playlistId, page)
          .pipe(map((response: any) => response.data));
      };

      this.galleryState.setFetchStrategy(fetchProxy);
    });
  }
}
