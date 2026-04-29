package config

import (
	"os"
	"testing"
)

func TestLoad_Defaults(t *testing.T) {
	// Clear env vars to test defaults
	os.Unsetenv("SERVER_PORT")
	os.Unsetenv("DATABASE_HOST")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Failed to load config: %v", err)
	}

	if cfg.Server.Port != 8080 {
		t.Errorf("Expected server port 8080, got %d", cfg.Server.Port)
	}
	if cfg.Database.Host != "localhost" {
		t.Errorf("Expected database host localhost, got %s", cfg.Database.Host)
	}
	if cfg.Worker.Size != 50 {
		t.Errorf("Expected worker size 50, got %d", cfg.Worker.Size)
	}
}

func TestLoad_EnvironmentVariables(t *testing.T) {
	os.Setenv("SERVER_PORT", "9090")
	os.Setenv("DATABASE_HOST", "db.example.com")
	defer os.Unsetenv("SERVER_PORT")
	defer os.Unsetenv("DATABASE_HOST")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Failed to load config: %v", err)
	}

	if cfg.Server.Port != 9090 {
		t.Errorf("Expected server port 9090, got %d", cfg.Server.Port)
	}
	if cfg.Database.Host != "db.example.com" {
		t.Errorf("Expected database host db.example.com, got %s", cfg.Database.Host)
	}
}
