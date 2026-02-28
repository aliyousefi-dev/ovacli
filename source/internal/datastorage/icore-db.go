package datastorage

import "ova-cli/source/internal/datatypes"

// DiskDataStorage defines methods for user and video data operations without context.
type DiskDataStorage interface {
	GetGlobalFilters() ([]datatypes.GlobalFilter, error)

	// User management
	InsertUser(user *datatypes.UserData) error
	DeleteUser(username string) (*datatypes.UserData, error)
	GetUserByUsername(username string) (*datatypes.UserData, error)
	GetUserByAccountID(accountID string) (*datatypes.UserData, error)
	GetAllUsers() ([]datatypes.UserData, error)

	// User favorites management
	GetSavedVideosByUser(accountId string) ([]string, error)
	AddVideoToSaved(accountId, videoID string) error
	RemoveVideoFromSaved(accountId, videoID string) error

	// User playlists management
	AddPlaylist(playlist *datatypes.PlaylistData) (*datatypes.PlaylistData, error)
	GetPlaylistByID(username, playlistSlug string) (*datatypes.PlaylistData, error)
	DeletePlaylistByID(username, playlistSlug string) error
	AddVideoToPlaylist(username, playlistSlug, videoID string) error
	RemoveVideoFromPlaylist(username, playlistSlug, videoID string) error
	ReorderPlaylists(username string, newOrderSlugs []string) error
	UpdatePlaylistInfo(username, playlistSlug, newTitle, newDescription string) error
	UpdateUserPassword(username, newHashedPassword string) error
	GetPlaylistVideoIDsPaginated(userId, playlistId string, page, limit int) ([]string, int, error)
	GetPlaylistsByUser(userId string) ([]datatypes.PlaylistData, error)

	// New method to get total video count
	GetTotalVideoCount() (int, error)

	// marker management
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
	AddTagToVideo(videoID, tag string) error
	RemoveTagFromVideo(videoID, tag string) error

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
