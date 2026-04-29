package db

import (
	"testing"

	"gorm.io/datatypes"
)

func TestScanJob_Creation(t *testing.T) {
	job := ScanJob{
		Targets:           datatypes.JSON(`["http://example.com"]`),
		TemplateSelectors: datatypes.JSON(`{"severity": "high"}`),
		Status:           "pending",
	}

	if job.Status != "pending" {
		t.Errorf("Expected status pending, got %s", job.Status)
	}
	if len(job.Targets) == 0 {
		t.Error("Expected targets to be set")
	}
	if len(job.TemplateSelectors) == 0 {
		t.Error("Expected template selectors to be set")
	}
}

func TestScanResult_Creation(t *testing.T) {
	result := ScanResult{
		Target:     "http://example.com",
		TemplateID: "CVE-2023-1234",
		Finding:    datatypes.JSON(`{"vulnerable": true}`),
	}

	if result.TemplateID != "CVE-2023-1234" {
		t.Errorf("Expected template ID CVE-2023-1234, got %s", result.TemplateID)
	}
	if len(result.Finding) == 0 {
		t.Error("Expected finding to be set")
	}
}

func TestTemplate_Creation(t *testing.T) {
	tmpl := Template{
		Name:     "CVE-2023-1234",
		Severity: "high",
		Tags:     datatypes.JSON(`["rce", "critical"]`),
		Content:  "template content here",
		Version:  "1.0.0",
	}
	if tmpl.Name != "CVE-2023-1234" {
		t.Errorf("Expected template name CVE-2023-1234, got %s", tmpl.Name)
	}
	if len(tmpl.Tags) == 0 {
		t.Error("Expected tags to be set")
	}
}

func TestTarget_Creation(t *testing.T) {
	target := Target{
		Address:  "http://example.com",
		Metadata: datatypes.JSON(`{"source": "manual"}`),
	}
	if target.Address != "http://example.com" {
		t.Errorf("Expected address http://example.com, got %s", target.Address)
	}
	if len(target.Metadata) == 0 {
		t.Error("Expected metadata to be set")
	}
}
