package repo

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
)

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) GetAllSpaces() {
	// return all existing spaces
}

// CreateSpace creates a new space with a directory and owner.
func (r *RepoManager) CreateSpace(spacedata datatypes.SpaceData) error {

	// Save space data in disk storage
	if err := r.diskDataStorage.CreateSpace(&spacedata); err != nil {
		return fmt.Errorf("failed to save space data: %w", err)
	}

	return nil
}

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) DeleteSpace(space string) {
	r.DeleteSpaceDirectory(space)
}

func (r *RepoManager) GetSpaceByID(space string) {

}

func (r *RepoManager) GetSpaceSettings(space string) {

}

func (r *RepoManager) UpdateSpaceSettings(space string) {

}

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) AddUserToSpace(user string, space *datatypes.SpaceData) {

}

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) RemoveUserFromSpace(user string, space *datatypes.SpaceData) {

}

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) GetUsersInSpace(space *datatypes.SpaceData) {

}

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) SetSpacePrivacy(space *datatypes.SpaceData) {

}

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) CheckUserInSpace(space *datatypes.SpaceData) {

}

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) AssignRoleToUserInSpace(space *datatypes.SpaceData) {

}

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) RemoveRoleFromUserInSpace(space *datatypes.SpaceData) {

}

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) SpaceExists(spaceID string) {

}

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) IsUserSpaceOwner(spaceID string) {

}

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) GetSpaceUsage(spaceID string) {

}

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) GetTotalVideosOnSpace(spaceID string) {

}

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) TransferSpaceOwnership(space *datatypes.SpaceData, newOwner string) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}

	return nil
}

func (r *RepoManager) GetVideoCountInSpace(spacePath string) (int, error) {
	if !r.IsDataStorageInitialized() {
		return 0, fmt.Errorf("data storage is not initialized")
	}

	return r.diskDataStorage.GetVideoCountInSpace(spacePath)
}

func (r *RepoManager) GetVideoIDsBySpaceInRange(spacePath string, start, end int) ([]string, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}

	return r.diskDataStorage.GetVideoIDsBySpaceInRange(spacePath, start, end)
}
