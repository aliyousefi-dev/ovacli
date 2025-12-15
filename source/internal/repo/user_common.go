package repo

import (
	"fmt"
	"ova-cli/source/internal/datastorage/datatypes"
)

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) CreateUser(userdata *datatypes.UserData) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}
	// Store user
	if err := r.diskDataStorage.CreateUser(userdata); err != nil {
		return fmt.Errorf("failed to create user in data storage: %w", err)
	}
	return nil
}

// DeleteUser removes a user by username and returns the deleted user data.
func (r *RepoManager) DeleteUser(username string) (*datatypes.UserData, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}

	// Call DeleteUser from the dataStorage and return the deleted user data
	return r.diskDataStorage.DeleteUser(username)
}

// GetAllUsers retrieves all users from the storage.
func (r *RepoManager) GetAllUsers() ([]datatypes.UserData, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.GetAllUsers()
}

// GetUserByUsername retrieves a single user by username.
func (r *RepoManager) GetUserByUsername(username string) (*datatypes.UserData, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.GetUserByUsername(username)
}

// GetUserByUsername retrieves a single user by username.
func (r *RepoManager) GetUserByAccountID(accountID string) (*datatypes.UserData, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.GetUserByAccountID(accountID)
}
