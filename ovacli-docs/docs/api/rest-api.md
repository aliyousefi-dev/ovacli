<!--
{
	"nav_order": 1
}
-->

# Rest API

here we can work on thing that we can do more.

### Auth

```yaml
/api/v1/auth/login #login user
/api/v1/auth/logout #logout user
/api/v1/auth/status #check user status

```

### User

```yaml
/api/v1/users/:username/saved #get saved videos for user
/api/v1/users/:username/saved/:videoId #get specific saved video for user
/api/v1/users/:username/playlists #get all playlists for a user
/api/v1/users/:username/playlists/:slug #get user's playlist by slug
/api/v1/users/:username/playlists/:slug/videos #get videos in a user's playlist
/api/v1/users/:username/watched #get watched videos for user
/api/v1/users/:username/online-status #get online status for user
```

### Videos

```yaml
/api/v1/videos/global #get all global videos
/api/v1/videos/batch #batch video operations
/api/v1/videos/:videoId #get specific video
/api/v1/videos/:videoId/similar #get similar videos to a specific video
/api/v1/video/markers/:videoId #get video markers
```

### Tags

```yaml
/api/v1/videos/tags/:videoID #get tags for a specific video
/api/v1/videos/tags/:videoID/add #add tag to video
/api/v1/videos/tags/:videoID/remove #remove tag from video
```

### Media Operations

```yaml
/api/v1/upload #upload videos
/api/v1/stream/:video-id #stream a video
/api/v1/download/:videoId #download a video
/api/v1/download/:videoId/trim #download and trim video
```

### Previews & Thumbnails

```yaml
/api/v1/preview/:videoId #get video preview
/api/v1/thumbnail/:videoId #get video thumbnail
/api/v1/preview-thumbnails/:videoId/:filename #get video preview thumbnail
```

### Search

```yaml
/api/v1/search #search videos
/api/v1/search-suggestions #get search suggestions
```

### Analytics & Status

```yaml
/api/v1/server-status #check server status
```
