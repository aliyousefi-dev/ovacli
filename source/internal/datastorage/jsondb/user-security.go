package jsondb

import "fmt"

func (s *JsonDB) UpdateUserPassword(accountId, newHashedPassword string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	users, err := s.loadUsers()
	if err != nil {
		return fmt.Errorf("failed to load users: %w", err)
	}

	user, exists := users[accountId]
	if !exists {
		return fmt.Errorf("user %q not found", accountId)
	}

	user.PasswordHash = newHashedPassword

	users[accountId] = user

	return s.saveUsers(users)

}
