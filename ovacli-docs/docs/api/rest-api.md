<!--
{
	"nav_order": 1
}
-->

# Rest API

here we can work on thing that we can do more.

### API Schema

```yaml
/api/v1/auth/login #login user
/api/v1/auth/logout #logout user
/api/v1/auth/status #check user status
/api/v1/auth/profile #get user profile
/api/v1/auth/password #change user password
/api/v1/users/:username/saved #get saved videos for user
/api/v1/users/:username/saved/:videoId #get specific saved video for user
/api/v1/users/:username/playlists/:slug #get user's playlist by slug
/api/v1/users/:username/playlists/:slug/videos #get videos in a user's playlist
/api/v1/users/:username/playlists #get all playlists for a user
/api/v1/users/:username/watched #get watched videos for user

/api/v1/videos/batch #batch video operations
/api/v1/videos/global #get all global videos
/api/v1/videos/:videoId #get specific video
/api/v1/videos/:videoId/similar #get similar videos to a specific video
/api/v1/videos/tags/:videoID #get tags for a specific video
/api/v1/videos/tags/:videoID/add #add tag to video
/api/v1/videos/tags/:videoID/remove #remove tag from video

/api/v1/stream/:video-id #stream a video
/api/v1/download/:videoId #download a video
/api/v1/download/:videoId/trim #download and trim video

/api/v1/preview-thumbnails/:videoId/:filename #get video preview thumbnail
/api/v1/preview/:videoId #get video preview
/api/v1/thumbnail/:videoId #get video thumbnail

/api/v1/video/markers/:videoId #get video markers

/api/v1/search-suggestions #get search suggestions
/api/v1/search #search videos

/api/v1/spaces #get spaces
/api/v1/spaces/list #get list of spaces

/api/v1/server-status #check server status

/api/v1/upload #upload videos
```
