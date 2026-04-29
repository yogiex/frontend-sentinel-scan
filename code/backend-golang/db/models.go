package db

import (
	"time"

	"gorm.io/datatypes"
)

type ScanJob struct {
	ID                uint           `gorm:"primaryKey" json:"id"`
	Targets           datatypes.JSON `json:"targets"`
	TemplateSelectors datatypes.JSON `json:"template_selectors"`
	Status            string         `gorm:"default:pending" json:"status"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
}

type ScanResult struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	ScanID     uint           `gorm:"foreignKey:ScanID;references:ID;constraint:OnDelete:CASCADE" json:"scan_id"`
	Target     string         `json:"target"`
	TemplateID string         `json:"template_id"`
	Finding    datatypes.JSON `json:"finding"`
	CreatedAt  time.Time      `json:"created_at"`
}

type Template struct {
	ID       uint           `gorm:"primaryKey" json:"id"`
	Name     string         `json:"name"`
	Severity string         `json:"severity"`
	Tags     datatypes.JSON `json:"tags"`
	Content  string         `json:"content"`
	Version  string         `json:"version"`
	CreatedAt time.Time     `json:"created_at"`
}

type Target struct {
	ID       uint           `gorm:"primaryKey" json:"id"`
	Address  string         `gorm:"unique" json:"address"`
	Metadata datatypes.JSON `json:"metadata"`
	CreatedAt time.Time     `json:"created_at"`
}
