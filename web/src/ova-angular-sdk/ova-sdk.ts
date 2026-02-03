import { Injectable, inject } from '@angular/core';

import { AuthApiService } from './rest-api/auth-api.service';
import { VideoApiService } from './rest-api/video-api.service';
import { PlaylistAPIService } from './rest-api/playlist-api.service';
import { SearchApiService } from './rest-api/search-api.service';
import { UploadApiService } from './rest-api/upload-api.service';
import { GlobalVideosService } from './rest-api/global-api.service';
import { GlobalFiltersApiService } from './rest-api/global-filters-api.service';
import { MarkerApiService } from './rest-api/marker-api.service';
import { PlaylistContentAPIService } from './rest-api/playlist-content-api.service';
import { ProfileApiService } from './rest-api/profile-api.service';
import { AssetMap } from './rest-api/api-assets';
import { WatchedApiService } from './rest-api/recent-api.service';
import { SavedApiService } from './rest-api/saved-api.service';
import { ScrubThumbApiService } from './rest-api/scrub-thumb-api.service';
import { SuggestionApiService } from './rest-api/search-suggestion-api.service';

@Injectable({
  providedIn: 'root',
})
export class OVASDK {
  readonly auth = inject(AuthApiService);
  readonly profile = inject(ProfileApiService);
  readonly videos = inject(VideoApiService);
  readonly global = inject(GlobalVideosService);
  readonly globalFilters = inject(GlobalFiltersApiService);
  readonly playlists = inject(PlaylistAPIService);
  readonly playlistContent = inject(PlaylistContentAPIService);
  readonly search = inject(SearchApiService);
  readonly upload = inject(UploadApiService);
  readonly marker = inject(MarkerApiService);
  readonly assets = inject(AssetMap);
  readonly history = inject(WatchedApiService);
  readonly saved = inject(SavedApiService);
  readonly scrub = inject(ScrubThumbApiService);
  readonly searchSuggestion = inject(SuggestionApiService);
}
