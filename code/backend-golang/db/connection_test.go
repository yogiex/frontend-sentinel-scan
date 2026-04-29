package db

import (
	"testing"
)

func TestNewConnection_InvalidDSN(t *testing.T) {
	cfg := DatabaseConfig{
		Host:     "invalid-host",
		Port:     5432,
		User:     "postgres",
		Password: "wrong",
		DBName:   "vulnscanner",
		SSLMode:  "disable",
	}

	_, err := NewConnection(cfg)
	if err == nil {
		t.Error("Expected error for invalid DSN, got nil")
	}
}
