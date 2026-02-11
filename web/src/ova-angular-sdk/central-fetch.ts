import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

import { VideoData } from './core-types/video-data';

import { GlobalVideosService } from './rest-api/global-api.service';
import { VideoApiService } from './rest-api/video-api.service';
import { WatchedApiService } from './rest-api/recent-api.service';
import { SavedApiService } from './rest-api/saved-api.service';
import { PlaylistContentAPIService } from './rest-api/playlist-content-api.service';

import { GalleryContainer } from './core-types/video-gallery';

@Injectable({
  providedIn: 'root',
})
export class CentralFetchService {
  constructor(
    private globalVideosService: GlobalVideosService,
    private videoApiService: VideoApiService,
    private watchedApiService: WatchedApiService,
    private savedApiService: SavedApiService,
    private playlistContentAPIService: PlaylistContentAPIService,
  ) {}

  // Fetch the gallery data using LatestVideosService and switch based on route
  fetchGallery(
    route: string = 'global', // Default route is 'recent'
    bucket: number = 1, // Default bucket is 1
    slug?: string, // Optional slug for playlists
  ): Observable<GalleryContainer> {
    switch (route) {
      case 'global': {
        // Use LatestVideosService to fetch the latest videos for the given bucket
        return this.globalVideosService.fetchGlobalVideos(bucket).pipe(
          switchMap((response) => {
            const totalVideos = response.data.totalVideos;
            const currentBucket = response.data.currentBucket;
            const bucketContentSize = response.data.bucketContentSize;
            const totalBuckets = response.data.totalBuckets;

            // Fetch video details using VideoApiService
            return this.videoApiService
              .getVideosByIds(response.data.videoIds)
              .pipe(
                map((videoDetails) => {
                  const videos: VideoData[] = videoDetails.data;
                  // Construct and return the final GalleryResponse
                  return {
                    videos: videos,
                    totalVideos: totalVideos,
                    currentBucket: currentBucket,
                    bucketContentSize: bucketContentSize,
                    totalBuckets: totalBuckets,
                  };
                }),
              );
          }),
        );
      }

      case 'playlist-content': {
        // Ensure we have the slug for the playlist route
        if (!slug) {
          throw new Error('Slug is required for playlist fetching');
        }

        // Use PlaylistContentAPIService to fetch the playlist contents for the given user and slug
        return this.playlistContentAPIService
          .fetchPlaylistContent(slug, bucket) // Pass the slug here
          .pipe(
            switchMap((response) => {
              const totalVideos = response.data.totalVideos;
              const currentBucket = response.data.currentBucket;
              const bucketContentSize = response.data.bucketContentSize;
              const totalBuckets = response.data.totalBuckets;

              // Fetch video details using VideoApiService
              return this.videoApiService
                .getVideosByIds(response.data.videoIds)
                .pipe(
                  map((videoDetails) => {
                    const videos: VideoData[] = videoDetails.data;
                    // Construct and return the final GalleryResponse
                    return {
                      videos: videos,
                      totalVideos: totalVideos,
                      currentBucket: currentBucket,
                      bucketContentSize: bucketContentSize,
                      totalBuckets: totalBuckets,
                    };
                  }),
                );
            }),
          );
      }

      // You can add more routes like 'favorites' or others as needed
      default: {
        return new Observable<GalleryContainer>(); // Return an empty observable for unknown routes
      }
    }
  }
}
