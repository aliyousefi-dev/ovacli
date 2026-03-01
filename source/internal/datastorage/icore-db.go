package datastorage

import "ova-cli/source/internal/datatypes"

// DiskDataStorage defines methods for user and video data operations without context.
type DiskDataStorage interface {
	GetGlobalFilters() ([]datatypes.GlobalFilter, error)

	// User management
	InsertUser(userData *datatypes.UserData) error
	DeleteUser(accountId string) (*datatypes.UserData, error)
	GetUserByUsername(username string) (*datatypes.UserData, error) // slower than by account Id
	GetUserByAccountID(accountId string) (*datatypes.UserData, error)
	GetAllUsers() ([]datatypes.UserData, error)

	// User favorites management
	GetSavedVideosByUser(accountId string) ([]string, error)
	AddVideoToSaved(accountId, videoId string) error
	RemoveVideoFromSaved(accountId, videoId string) error

	// User playlists management
	InsertPlaylist(playlistData *datatypes.PlaylistData) (*datatypes.PlaylistData, error)
	GetPlaylistByID(accountId, playlistId string) (*datatypes.PlaylistData, error)
	DeletePlaylistByID(accountId, playlistId string) error
	AddVideoToPlaylist(accountId, playlistId, videoId string) error
	RemoveVideoFromPlaylist(accountId, playlistId, videoId string) error
	ReorderPlaylists(accountId string, newOrderSlugs []string) error
	UpdateUserPassword(accountId, newHashedPassword string) error
	GetPlaylistVideoIDsPaginated(accountId, playlistId string, page, limit int) ([]string, int, error)
	GetPlaylistsByUser(accountId string) ([]datatypes.PlaylistData, error)

	GetTotalVideoCount() (int, error)

	InsertMarker(videoId string, markerData datatypes.MarkerData) error
	GetMarkersForVideo(videoID string) ([]datatypes.MarkerData, error)
	DeleteMarkersForVideo(videoID string) error

	InsertVideoLookup(videoId string, vidoePath string) error
	GetVideoLookup(videoId string) (string, error)

	// New method to add video to user's watched list
	GetUserWatchedVideos(accountId string) ([]string, error)
	AddVideoToWatched(accountId, videoID string) error
	ClearUserWatchedHistory(accountId string) error

	// Video tags management
	AddTagToVideo(videoId, tag string) error
	RemoveTagFromVideo(videoId, tag string) error

	// Video management
	InsertVideo(video datatypes.VideoData) error
	GetAllVideos() ([]datatypes.VideoData, error)
	GetVideoByID(videoId string) (*datatypes.VideoData, error)
	DeleteVideoByID(videoId string) error
	DeleteAllVideos() error

	SearchVideos(criteria datatypes.VideoSearchCriteria) ([]string, error)
	SimilarSearch(videoId string) ([]datatypes.VideoData, error)
	QuickSearch(query string) ([]string, error)
}
