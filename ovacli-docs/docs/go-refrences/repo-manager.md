<!--
{
	"nav_order": 2
}
-->

# Repo Manager

repo manager class is the core class of the ova . it handle all top level logics

### Variables

here you can find all the variables used in the repo manager class

```yaml
- rootDir # path of direcotry
- AuthEnabled #enable auth <default=true>
```

### Events

The following tables store collections of records, where each record is an instance of a specific data structure defined elsewhere in the documentation. These tables are essential for organizing and managing the application's data.

```yaml
- OnInit() # Initialize repo and cache videos.
- OnShutdown() # Shutdown repo and save sessions.
```

### Functions

The following tables store collections of records, where each record is an instance of a specific data structure defined elsewhere in the documentation. These tables are essential for organizing and managing the application's data.

```yaml
- InitDataStorage() # Initialize repository and storage.
- CreateRepoFolder() # Create the .ova-repo directory.
- CreateRepoWithUser(username, password, useBoltDB) # Create a new repo and admin user.
- CreateDefaultConfigFile() # Create default config file.
- GetDefaultConfig() # Get default config object.
- GetDefaultConfigTemplate() # Get default config template from file.
- LoadRepoConfig() # Load repo config from disk.
- SaveRepoConfig(cfg) # Save repo config to disk.
- GetConfigs() # Get current config object.
- CreateDefaultConfigFileWithStorageType(rootuser, storageType) # Create default config with storage type.
- ScanDiskForVideos() # Find all video files on disk.
- ScanDiskForVideosRelPath() # Find all video files (relative paths).
- IsVideoFile(filename) # Check if file is a video.
- ScanDiskForFolders() # Find all folders on disk.
- GetRepoSize() # Get total repo size.
- GetTotalVideoCountOnRepository() # Count all videos in repo.
- PurgeRepository() # Delete the entire repository.
- GetRepoInfo() # Get repository info summary.
- GetRootUsername() # Get the root user name.
- AddSession(sessionID, username) # Add a user session.
- GetUsernameBySession(sessionID) # Get username by session ID.
- DeleteSession(sessionID) # Delete a user session.
- SaveUserSessionOnDisk() # Save sessions to disk.
- LoadUserSessionsFromDisk() # Load sessions from disk.
- ClearAllSessions() # Clear all user sessions.
- IsRepoExists() # Check if repo exists.
- IsDataStorageInitialized() # Check if storage is initialized.
- FolderExists(folderPath) # Check if folder exists.
- CreateSpaceDirectory(space) # Create a space directory.
- DeleteSpaceDirectory(space) # Delete a space directory.
- CreateSubSpace(parentSpace, subSpaceName) # Create a sub-space.
- DeleteSubSpace(parentSpace, subSpaceName) # Delete a sub-space.
- GetGroupsInSpace(spaceId) # Get groups in a space.
- CreateGroupInSpace(spaceId, groupName) # Create group in space.
- RemoveGroupFromSpace(spaceId, groupName) # Remove group from space.
- CreateVirtualSpace(space_name) # Create a virtual space.
- ScanAndAddAllSpaces() # Scan and add all spaces.
- IndexMultiSpaces(spacePaths) # Index multiple spaces.
- GenerateCA(password, commonName) # Generate CA certificate.
- UpdateUserPassword(username, newHashedPassword) # Update user password.
- AddVideoToPlaylist(username, slug, videoID) # Add video to playlist.
- RemoveVideoFromPlaylist(username, slug, videoID) # Remove video from playlist.
- GetUserPlaylistContentVideosInRange(username, playlistSlug, start, end) # Get playlist videos in range.
- GetUserPlaylistContentVideosCount(username, playlistSlug) # Get playlist video count.
```
