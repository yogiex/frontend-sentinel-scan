package template

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"gopkg.in/yaml.v3"
)

type Loader struct {
	templateDir string
}

func NewLoader(templateDir string) (*Loader, error) {
	_, err := os.Stat(templateDir)
	if err != nil {
		if os.IsNotExist(err) {
			if err := os.MkdirAll(templateDir, 0755); err != nil {
				return nil, fmt.Errorf("failed to create template dir: %w", err)
			}
		} else {
			return nil, fmt.Errorf("failed to stat template dir: %w", err)
		}
	}
	return &Loader{templateDir: templateDir}, nil
}

func (l *Loader) Get(templateID string) (*NucleiTemplate, error) {
	// Reject invalid template IDs to prevent path traversal
	if strings.ContainsAny(templateID, `/\`) || strings.Contains(templateID, "..") {
		return nil, fmt.Errorf("invalid template ID: %s", templateID)
	}
	path := filepath.Join(l.templateDir, fmt.Sprintf("%s.yaml", templateID))
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read template %s: %w", templateID, err)
	}

	var tmpl NucleiTemplate
	if err := yaml.Unmarshal(data, &tmpl); err != nil {
		return nil, fmt.Errorf("failed to parse template %s: %w", templateID, err)
	}

	if tmpl.ID == "" {
		return nil, fmt.Errorf("template %s missing required 'id' field", templateID)
	}

	return &tmpl, nil
}

func (l *Loader) List() ([]*NucleiTemplate, error) {
	var templates []*NucleiTemplate
	err := filepath.Walk(l.templateDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err // Propagate walk errors (e.g., permission denied)
		}
		if filepath.Ext(path) != ".yaml" {
			return nil
		}

		data, err := os.ReadFile(path)
		if err != nil {
			return nil // Skip unreadable files
		}

		var tmpl NucleiTemplate
		if err := yaml.Unmarshal(data, &tmpl); err != nil {
			return nil // Skip invalid YAML
		}
		templates = append(templates, &tmpl)
		return nil
	})

	if err != nil {
		return nil, err
	}
	return templates, nil
}
