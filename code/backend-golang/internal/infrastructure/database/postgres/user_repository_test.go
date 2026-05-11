package postgres

import (
	"context"
	"testing"

	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/domain/entity"
)

func TestUserRepository_Create(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUserRepository(db)

	user := &entity.User{
		Username:     "testuser",
		Email:        "test@example.com",
		PasswordHash: "hashed-password",
		Role:         entity.RoleViewer,
		Active:       true,
	}

	err := repo.Create(context.Background(), user)
	if err != nil {
		t.Fatalf("Create failed: %v", err)
	}
	if user.ID == 0 {
		t.Error("User ID should be set after create")
	}
}

func TestUserRepository_FindByID(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUserRepository(db)

	user := &entity.User{
		Username:     "findme",
		Email:        "findme@example.com",
		PasswordHash: "hash",
		Role:         entity.RoleAdmin,
		Active:       true,
	}
	repo.Create(context.Background(), user)

	found, err := repo.FindByID(context.Background(), user.ID)
	if err != nil {
		t.Fatalf("FindByID failed: %v", err)
	}
	if found.Username != "findme" {
		t.Errorf("Username = %s, want findme", found.Username)
	}
	if found.Role != entity.RoleAdmin {
		t.Errorf("Role = %v, want admin", found.Role)
	}
}

func TestUserRepository_FindByID_NotFound(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUserRepository(db)

	_, err := repo.FindByID(context.Background(), 999)
	if err == nil {
		t.Error("FindByID expected error for non-existent user")
	}
}

func TestUserRepository_FindByUsername(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUserRepository(db)

	user := &entity.User{
		Username:     "uniqueuser",
		Email:        "unique@example.com",
		PasswordHash: "hash",
		Role:         entity.RoleViewer,
	}
	repo.Create(context.Background(), user)

	found, err := repo.FindByUsername(context.Background(), "uniqueuser")
	if err != nil {
		t.Fatalf("FindByUsername failed: %v", err)
	}
	if found.ID != user.ID {
		t.Errorf("Found user ID = %d, want %d", found.ID, user.ID)
	}
	if found.Email != "unique@example.com" {
		t.Errorf("Email = %s, want unique@example.com", found.Email)
	}
}

func TestUserRepository_FindByUsername_NotFound(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUserRepository(db)

	_, err := repo.FindByUsername(context.Background(), "nonexistent")
	if err == nil {
		t.Error("FindByUsername expected error for non-existent user")
	}
}

func TestUserRepository_Update(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUserRepository(db)

	user := &entity.User{
		Username:     "updateuser",
		Email:        "update@example.com",
		PasswordHash: "old-hash",
		Role:         entity.RoleViewer,
		Active:       true,
	}
	repo.Create(context.Background(), user)

	user.Email = "updated@example.com"
	user.Role = entity.RoleAdmin
	err := repo.Update(context.Background(), user)
	if err != nil {
		t.Fatalf("Update failed: %v", err)
	}

	found, _ := repo.FindByID(context.Background(), user.ID)
	if found.Email != "updated@example.com" {
		t.Errorf("Email after update = %s, want updated@example.com", found.Email)
	}
	if found.Role != entity.RoleAdmin {
		t.Errorf("Role after update = %v, want admin", found.Role)
	}
}

func TestUserRepository_HasPermission(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUserRepository(db)

	t.Run("admin has scan permission", func(t *testing.T) {
		user := &entity.User{Username: "admin1", Email: "admin1@test.com", PasswordHash: "h", Role: entity.RoleAdmin}
		repo.Create(context.Background(), user)

		has, err := repo.HasPermission(context.Background(), user.ID, entity.PermScanCreate)
		if err != nil {
			t.Fatalf("HasPermission failed: %v", err)
		}
		if !has {
			t.Error("Admin should have ScanCreate permission")
		}
	})

	t.Run("viewer lacks admin permission", func(t *testing.T) {
		user := &entity.User{Username: "viewer1", Email: "viewer1@test.com", PasswordHash: "h", Role: entity.RoleViewer}
		repo.Create(context.Background(), user)

		has, err := repo.HasPermission(context.Background(), user.ID, entity.PermUserWrite)
		if err != nil {
			t.Fatalf("HasPermission failed: %v", err)
		}
		if has {
			t.Error("Viewer should not have UserManage permission")
		}
	})

	t.Run("non-existent user returns error", func(t *testing.T) {
		_, err := repo.HasPermission(context.Background(), 999, entity.PermScanCreate)
		if err == nil {
			t.Error("HasPermission expected error for non-existent user")
		}
	})
}

func TestUserRepository_DuplicateUsername(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUserRepository(db)

	user1 := &entity.User{Username: "dupe", Email: "first@test.com", PasswordHash: "h", Role: entity.RoleViewer}
	err := repo.Create(context.Background(), user1)
	if err != nil {
		t.Fatalf("First create failed: %v", err)
	}

	user2 := &entity.User{Username: "dupe", Email: "second@test.com", PasswordHash: "h", Role: entity.RoleViewer}
	err = repo.Create(context.Background(), user2)
	if err == nil {
		t.Error("Expected error for duplicate username")
	}
}
