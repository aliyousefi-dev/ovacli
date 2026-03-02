import { Observable } from 'rxjs';
import { PageContainer } from '../../../ova-angular-sdk/core-types/page-container';

export type GalleryFetchFn = (
  page: number,
  sortMode?: SortMode,
) => Observable<PageContainer>;

export type GalleryViewMode = 'page' | 'infinite-scroll';

export type VideoCardType = 'default' | 'mini';

export type SortMode =
  | 'title_asc'
  | 'title_desc'
  | 'duration_asc'
  | 'duration_desc'
  | 'date_asc'
  | 'date_desc';
