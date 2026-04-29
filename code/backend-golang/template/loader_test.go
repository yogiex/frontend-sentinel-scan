package template

import (
	"os"
	"testing"
)

func TestLoader_Get_NonExistent(t *testing.T) {
	loader, err := NewLoader("./test-templates")
	if err != nil {
		t.Fatalf("Failed to create loader: %v", err)
	}
	defer os.RemoveAll("./test-templates")

	_, err = loader.Get("non-existent")
	if err == nil {
		t.Error("Expected error for non-existent template, got nil")
	}
}

func TestLoader_Get_ValidTemplate(t *testing.T) {
	// Create test template dir
	os.MkdirAll("./test-templates", 0755)
	defer os.RemoveAll("./test-templates")

	// Write test template
	tmplContent := `
id: CVE-2023-1234
info:
  name: Test Vulnerability
  severity: high
  tags: [web, rce]
`
	os.WriteFile("./test-templates/CVE-2023-1234.yaml", []byte(tmplContent), 0644)

	loader, _ := NewLoader("./test-templates")
	tmpl, err := loader.Get("CVE-2023-1234")
	if err != nil {
		t.Fatalf("Failed to get template: %v", err)
	}

	if tmpl.ID != "CVE-2023-1234" {
		t.Errorf("Expected template ID CVE-2023-1234, got %s", tmpl.ID)
	}
}

func TestLoader_List(t *testing.T) {
	os.MkdirAll("./test-templates", 0755)
	defer os.RemoveAll("./test-templates")

	// Write two valid templates and one invalid one
	valid1 := `
id: tmpl-1
info:
  name: Valid 1
  severity: high
  tags: [web]
`
	valid2 := `
id: tmpl-2
info:
  name: Valid 2
  severity: medium
  tags: [api]
`
	invalid := `invalid yaml: [`
	os.WriteFile("./test-templates/tmpl-1.yaml", []byte(valid1), 0644)
	os.WriteFile("./test-templates/tmpl-2.yaml", []byte(valid2), 0644)
	os.WriteFile("./test-templates/invalid.yaml", []byte(invalid), 0644)

	loader, _ := NewLoader("./test-templates")
	templates, err := loader.List()
	if err != nil {
		t.Fatalf("List() returned error: %v", err)
	}
	if len(templates) != 2 {
		t.Errorf("Expected 2 valid templates, got %d", len(templates))
	}
}
