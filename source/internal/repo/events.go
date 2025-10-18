package repo

import "fmt"

// OnInit initializes the repository by caching the latest videos
func (r *RepoManager) OnInit() error {

	if err := r.LoadUserSessionsFromDisk(); err != nil {
		return fmt.Errorf("failed to load user sessions from disk: %w", err)
	}

	// Fetch the total number of videos in the persistent storage
	_, err := r.GetTotalIndexedVideoCount() // Fetch the total video count from the database
	if err != nil {
		return fmt.Errorf("failed to get total video count: %w", err)
	}

	return nil
}

// OnShutdown gracefully shuts down the repository, ensuring all data is persisted and resources are released.
func (r *RepoManager) OnShutdown() error {

	// Attempt to save all user session data to disk
	if err := r.SaveUserSessionOnDisk(); err != nil {
		return fmt.Errorf("failed to save session data: %w", err)
	}

	return nil
}
