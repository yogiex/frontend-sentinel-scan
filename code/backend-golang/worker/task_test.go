package worker

import (
	"testing"
)

func TestTask_Creation(t *testing.T) {
	task := Task{
		ID:         "scan-1-target-1",
		ScanID:     1,
		Target:     "http://example.com",
		TemplateID: "CVE-2023-1234",
	}

	if task.ScanID != 1 {
		t.Errorf("Expected scan ID 1, got %d", task.ScanID)
	}
}
