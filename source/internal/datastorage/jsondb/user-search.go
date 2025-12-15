package jsondb

import (
	"fmt"
	"ova-cli/source/internal/datastorage/datatypes"
)

// GetUserByUsername finds a user by their username.
// Returns a pointer to a copy of UserData if found, or an error if the user does not exist.
func (s *JsonDB) GetUserByUsername(username string) (*datatypes.UserData, error) {
	s.mu.Lock() // Ensure concurrent reads are safe
	defer s.mu.Unlock()

	users, err := s.loadUsers()
	if err != nil {
		return nil, fmt.Errorf("failed to load users: %w", err)
	}

	// Iterate over the map to find the user by username
	var foundUser *datatypes.UserData
	for _, user := range users {
		if user.Username == username {
			foundUser = &user
			break
		}
	}

	if foundUser == nil {
		return nil, fmt.Errorf("user %q not found", username)
	}

	// Return the pointer to the found user
	return foundUser, nil
}

// GetUserByUsername finds a user by their username.
// Returns a pointer to a copy of UserData if found, or an error if the user does not exist.
func (s *JsonDB) GetUserByAccountID(accountID string) (*datatypes.UserData, error) {
	s.mu.Lock() // Ensure concurrent reads are safe
	defer s.mu.Unlock()

	users, err := s.loadUsers()
	if err != nil {
		return nil, fmt.Errorf("failed to load users: %w", err)
	}

	user, exists := users[accountID]
	if !exists {
		return nil, fmt.Errorf("user with account ID %q not found", accountID)
	}
	// Return a pointer to a copy to prevent external modification of the map's stored value
	return &user, nil
}
