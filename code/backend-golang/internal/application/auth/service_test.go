package auth

import (
	"context"
	"testing"
)

// MockUserRepository untuk testing
type MockUserRepository struct {
	users map[string]*User // username -> user
}

func NewMockUserRepository() *MockUserRepository {
	return &MockUserRepository{
		users: make(map[string]*User),
	}
}

func (m *MockUserRepository) Create(user *User) error {
	if _, exists := m.users[user.Username]; exists {
		return ErrUsernameExists
	}
	user.ID = uint(len(m.users) + 1)
	m.users[user.Username] = user
	return nil
}

func (m *MockUserRepository) FindByUsername(username string) (*User, error) {
	user, exists := m.users[username]
	if !exists {
		return nil, ErrUserNotFound
	}
	return user, nil
}

func (m *MockUserRepository) FindByID(id uint) (*User, error) {
	for _, u := range m.users {
		if u.ID == id {
			return u, nil
		}
	}
	return nil, ErrUserNotFound
}

// TestAuthService_Register menguji registrasi user
func TestAuthService_Register(t *testing.T) {
	repo := NewMockUserRepository()
	service := NewAuthService(repo, "test-secret")

	tests := []struct {
		name     string
		username string
		email    string
		password string
		wantErr  bool
	}{
		{"register sukses", "user1", "user1@example.com", "password123", false},
		{"username sudah ada", "user1", "user2@example.com", "password123", true}, // Duplicate
		{"password kosong", "user2", "user2@example.com", "", true},           // Invalid
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			user, err := service.Register(context.Background(), tt.username, tt.email, tt.password)
			if (err != nil) != tt.wantErr {
				t.Errorf("Register() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr {
				if user == nil {
					t.Error("Register() returned nil user")
				}
				if user.Username != tt.username {
					t.Errorf("Register() username = %s, want %s", user.Username, tt.username)
				}
				// Password harus ter-hash (tidak sama dengan plaintext)
				if user.PasswordHash == tt.password {
					t.Error("Register() password not hashed")
				}
			}
		})
	}
}

// TestAuthService_Login menguji login user
func TestAuthService_Login(t *testing.T) {
	repo := NewMockUserRepository()
	service := NewAuthService(repo, "test-secret")

	// Setup: register user dulu
	_, err := service.Register(context.Background(), "testuser", "test@example.com", "password123")
	if err != nil {
		t.Fatalf("Failed to register user in setup: %v", err)
	}

	tests := []struct {
		name     string
		username string
		password string
		wantErr  bool
	}{
		{"login sukses", "testuser", "password123", false},
		{"password salah", "testuser", "wrongpass", true},
		{"user tidak ada", "nonexistent", "password123", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			token, err := service.Login(context.Background(), tt.username, tt.password)
			if (err != nil) != tt.wantErr {
				t.Errorf("Login() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr {
				if token == "" {
					t.Error("Login() returned empty token")
				}
			}
		})
	}
}

// TestAuthService_GetUserByID menguji pengambilan user by ID
func TestAuthService_GetUserByID(t *testing.T) {
	repo := NewMockUserRepository()
	service := NewAuthService(repo, "test-secret")

	// Setup
	user, err := service.Register(context.Background(), "testuser", "test@example.com", "password123")
	if err != nil {
		t.Fatalf("Failed to register user: %v", err)
	}

	tests := []struct {
		name    string
		userID  uint
		wantErr bool
	}{
		{"get user valid", user.ID, false},
		{"user tidak ada", 999, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := service.GetUserByID(context.Background(), tt.userID)
			if (err != nil) != tt.wantErr {
				t.Errorf("GetUserByID() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr {
				if got == nil {
					t.Error("GetUserByID() returned nil user")
				}
			}
		})
	}
}


