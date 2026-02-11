import { Observable } from 'rxjs';
import { PageContainer } from '../../../ova-angular-sdk/core-types/page-container';

export type GalleryFetchFn = (page: number) => Observable<PageContainer>;

export type GalleryViewMode = 'page' | 'infinite-scroll';
