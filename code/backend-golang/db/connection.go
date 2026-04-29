package db

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/config"
)

// DatabaseConfig is an alias for config.DatabaseConfig
type DatabaseConfig = config.DatabaseConfig

type Connection struct {
	DB *gorm.DB
}

func NewConnection(cfg DatabaseConfig) (*Connection, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.DBName, cfg.SSLMode,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Auto-migrate models
	if err := db.AutoMigrate(&ScanJob{}, &ScanResult{}, &Template{}, &Target{}); err != nil {
		return nil, fmt.Errorf("failed to auto-migrate: %w", err)
	}

	log.Println("Database connection established and migrations run")
	return &Connection{DB: db}, nil
}

func (c *Connection) Close() error {
	sqlDB, err := c.DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get underlying SQL DB: %w", err)
	}
	if err := sqlDB.Close(); err != nil {
		return fmt.Errorf("failed to close database connection: %w", err)
	}
	return nil
}

// Helper methods for scan jobs
func (c *Connection) CreateScanJob(job *ScanJob) error {
	if err := c.DB.Create(job).Error; err != nil {
		return fmt.Errorf("failed to create scan job: %w", err)
	}
	return nil
}

func (c *Connection) GetScanJob(id uint) (*ScanJob, error) {
	var job ScanJob
	if err := c.DB.First(&job, id).Error; err != nil {
		return nil, fmt.Errorf("failed to get scan job with id %d: %w", id, err)
	}
	return &job, nil
}
