import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { OVASDK } from '../../../ova-angular-sdk/ova-sdk';

import { GalleryPreview } from '../../components/gallery/gallery-preview/gallery-preview';
import { GalleryStateService } from '../../components/gallery/gallery-state.service';
import { GalleryFetchFn } from '../../components/gallery/types';
import { SearchCriteria } from '../../../ova-angular-sdk/rest-api/api-types/search-response';
import { SortMode } from '../../components/gallery/types';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, GalleryPreview],
  templateUrl: './search.page.html',
  providers: [GalleryStateService],
})
export class SearchPage implements OnInit {
  private ovaSdk = inject(OVASDK);
  private route = inject(ActivatedRoute);
  private galleryState = inject(GalleryStateService);

  ngOnInit(): void {
    this.route.queryParams.subscribe((param) => {
      const q: string | undefined = param['q'];
      const tags: string[] | undefined = this.normalizeTags(param['tags']);

      const fetchProxy: GalleryFetchFn = (
        page: number,
        sortMode?: SortMode,
      ) => {
        const searchCriteria: SearchCriteria = { query: q ?? '', tags: tags };
        return this.ovaSdk.search
          .searchVideos(searchCriteria, page, sortMode)
          .pipe(map((response) => response.data));
      };

      this.galleryState.setFetchStrategy(fetchProxy);
    });
  }

  normalizeTags(input: string | undefined): string[] {
    if (!input) return [];
    return input
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }
}
