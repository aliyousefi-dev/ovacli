export interface PlaylistSummary {
  title: string;
  description?: string;
  headVideoId: string;
  totalVideos: number;
  slug: string;
  order: number;
}

export interface PlaylistDataResponse {
  playlists: PlaylistSummary[];
  totalPlaylists: number;
  username: string;
}

export interface PlaylistContentResponse {
  username: string; // The username of the user
  slug: string; // The slug of the playlist
  videoIds: string[]; // Array of video IDs
  totalVideos: number; // Total number of videos cached
  currentBucket: number; // The current bucket requested
  bucketContentSize: number; // Size of each bucket (fixed to 20)
  totalBuckets: number; // Total number of buckets
}

export interface PlaylistContentResponse {
  username: string; // The username of the user
  slug: string; // The slug of the playlist
  videoIds: string[]; // Array of video IDs
  totalVideos: number; // Total number of videos cached
  currentBucket: number; // The current bucket requested
  bucketContentSize: number; // Size of each bucket (fixed to 20)
  totalBuckets: number; // Total number of buckets
}
